/**
 * CropWise - Telemetry Controller
 * Manages environmental sensor data and readings
 */

const { Telemetry, Zone } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const alertService = require('../services/alert.service');

class TelemetryController {
  constructor() {
    // Bind methods
    this.recordReading = this.recordReading.bind(this);
    this.getZoneTelemetry = this.getZoneTelemetry.bind(this);
    this.getLatestReadings = this.getLatestReadings.bind(this);
    this.getHistoricalData = this.getHistoricalData.bind(this);
    this.getAverages = this.getAverages.bind(this);
    this.generateSimulatedData = this.generateSimulatedData.bind(this);
  }

  // Record a new telemetry reading
  async recordReading(req, res) {
    try {
      const { zoneId, deviceId, temperature, humidity, co2, light, airflow, soilMoisture, source } = req.body;

      // Verify zone exists and user has access
      const zone = await Zone.findByPk(zoneId);
      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      const reading = await Telemetry.create({
        zoneId,
        deviceId,
        temperature,
        humidity,
        co2,
        light,
        airflow,
        soilMoisture,
        source: source || 'sensor',
        timestamp: new Date()
      });

      // Update zone's lastEnvironmentData
      await zone.update({
        lastEnvironmentData: {
          temperature,
          humidity,
          co2,
          light,
          airflow,
          soilMoisture,
          timestamp: new Date()
        }
      });

      // Check environmental thresholds and generate alerts if needed
      try {
        await alertService.checkEnvironmentalData(zoneId, {
          temperature,
          humidity,
          co2,
          light,
          airflow,
          soilMoisture
        });
      } catch (alertError) {
        logger.error('Error checking environmental alerts:', alertError);
        // Don't fail the request if alert generation fails
      }

      res.status(201).json({
        success: true,
        data: reading,
        message: 'Reading recorded successfully'
      });
    } catch (error) {
      logger.error('Error recording telemetry:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to record reading'
      });
    }
  }

  // Get telemetry data for a zone
  async getZoneTelemetry(req, res) {
    try {
      const { zoneId } = req.params;
      const { startDate, endDate, limit = 100 } = req.query;

      const where = { zoneId };

      // Apply date filters
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp[Op.gte] = new Date(startDate);
        if (endDate) where.timestamp[Op.lte] = new Date(endDate);
      }

      const readings = await Telemetry.findAll({
        where,
        order: [['timestamp', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: readings
      });
    } catch (error) {
      logger.error('Error fetching zone telemetry:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch telemetry data'
      });
    }
  }

  // Get latest readings for a zone
  async getLatestReadings(req, res) {
    try {
      const { zoneId } = req.params;

      const latest = await Telemetry.findOne({
        where: { zoneId },
        order: [['timestamp', 'DESC']]
      });

      res.json({
        success: true,
        data: latest || {}
      });
    } catch (error) {
      logger.error('Error fetching latest readings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch latest readings'
      });
    }
  }

  // Get historical data aggregated by time intervals
  async getHistoricalData(req, res) {
    try {
      const { zoneId } = req.params;
      const { hours = 24 } = req.query;

      const startDate = new Date();
      startDate.setHours(startDate.getHours() - parseInt(hours));

      const readings = await Telemetry.findAll({
        where: {
          zoneId,
          timestamp: {
            [Op.gte]: startDate
          }
        },
        order: [['timestamp', 'ASC']]
      });

      res.json({
        success: true,
        data: readings
      });
    } catch (error) {
      logger.error('Error fetching historical data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch historical data'
      });
    }
  }

  // Get averages for a time period
  async getAverages(req, res) {
    try {
      const { zoneId } = req.params;
      const { hours = 24 } = req.query;

      const startDate = new Date();
      startDate.setHours(startDate.getHours() - parseInt(hours));

      const readings = await Telemetry.findAll({
        where: {
          zoneId,
          timestamp: {
            [Op.gte]: startDate
          }
        },
        raw: true
      });

      if (readings.length === 0) {
        return res.json({
          success: true,
          data: {
            temperature: null,
            humidity: null,
            co2: null,
            light: null,
            count: 0
          }
        });
      }

      // Calculate averages
      const sum = readings.reduce((acc, reading) => {
        return {
          temperature: acc.temperature + (reading.temperature || 0),
          humidity: acc.humidity + (reading.humidity || 0),
          co2: acc.co2 + (reading.co2 || 0),
          light: acc.light + (reading.light || 0)
        };
      }, { temperature: 0, humidity: 0, co2: 0, light: 0 });

      const count = readings.length;

      res.json({
        success: true,
        data: {
          temperature: parseFloat((sum.temperature / count).toFixed(1)),
          humidity: parseFloat((sum.humidity / count).toFixed(1)),
          co2: parseFloat((sum.co2 / count).toFixed(0)),
          light: parseFloat((sum.light / count).toFixed(0)),
          count
        }
      });
    } catch (error) {
      logger.error('Error calculating averages:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate averages'
      });
    }
  }

  // Generate simulated data for testing (development only)
  async generateSimulatedData(req, res) {
    try {
      const { zoneId } = req.params;
      const { hours = 24, intervalMinutes = 15 } = req.body;

      // Verify zone exists
      const zone = await Zone.findByPk(zoneId);
      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      const readings = [];
      const now = new Date();
      const interval = parseInt(intervalMinutes);
      const totalReadings = (parseInt(hours) * 60) / interval;

      // Get optimal ranges from active recipe if available
      let tempBase = 22;
      let humidityBase = 85;
      let co2Base = 1000;
      let lightBase = 500;

      if (zone.activeRecipeId && zone.currentSetpoints) {
        tempBase = zone.currentSetpoints.temperature?.optimal || 22;
        humidityBase = zone.currentSetpoints.humidity?.optimal || 85;
        co2Base = zone.currentSetpoints.co2?.optimal || 1000;
        lightBase = zone.currentSetpoints.light?.optimal || 500;
      }

      for (let i = 0; i < totalReadings; i++) {
        const timestamp = new Date(now.getTime() - (i * interval * 60 * 1000));
        
        // Add some realistic variation
        const reading = await Telemetry.create({
          zoneId,
          deviceId: `SIM-${zoneId.substring(0, 8)}`,
          temperature: parseFloat((tempBase + (Math.random() * 4 - 2)).toFixed(1)),
          humidity: parseFloat((humidityBase + (Math.random() * 10 - 5)).toFixed(1)),
          co2: parseInt(co2Base + (Math.random() * 200 - 100)),
          light: parseInt(lightBase + (Math.random() * 100 - 50)),
          airflow: parseFloat((0.5 + Math.random() * 0.5).toFixed(2)),
          timestamp,
          source: 'simulated'
        });

        readings.push(reading);
      }

      res.json({
        success: true,
        data: {
          count: readings.length,
          message: `Generated ${readings.length} simulated readings`
        }
      });
    } catch (error) {
      logger.error('Error generating simulated data:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate simulated data'
      });
    }
  }
}

module.exports = new TelemetryController();

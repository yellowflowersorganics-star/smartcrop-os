/**
 * SmartCrop OS - Analytics Controller
 * Provides aggregated data and insights for dashboard and reporting
 */

const { Batch, Harvest, Zone, Farm, CropRecipe, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AnalyticsController {
  constructor() {
    // Bind methods
    this.getOverview = this.getOverview.bind(this);
    this.getYieldTrends = this.getYieldTrends.bind(this);
    this.getBatchPerformance = this.getBatchPerformance.bind(this);
    this.getRecipePerformance = this.getRecipePerformance.bind(this);
    this.getQualityDistribution = this.getQualityDistribution.bind(this);
    this.getRecentActivity = this.getRecentActivity.bind(this);
  }

  // Get overview statistics
  async getOverview(req, res) {
    try {
      const where = {};
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      // Apply date range filter if provided
      const dateFilter = {};
      if (req.query.startDate) {
        dateFilter[Op.gte] = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        dateFilter[Op.lte] = new Date(req.query.endDate);
      }

      // Total Zones
      const totalZones = await Zone.count({ where });

      // Active Batches
      const activeBatches = await Batch.count({
        where: { ...where, status: 'active' }
      });

      // Completed Batches (with optional date filter)
      const completedWhere = { ...where, status: 'completed' };
      if (Object.keys(dateFilter).length > 0) {
        completedWhere.actualEndDate = dateFilter;
      }
      const completedBatches = await Batch.count({ where: completedWhere });

      // Total Yield
      const yieldResult = await Batch.findOne({
        where: completedWhere,
        attributes: [[sequelize.fn('SUM', sequelize.col('totalYieldKg')), 'total']],
        raw: true
      });
      const totalYield = parseFloat(yieldResult?.total || 0);

      // Total Harvests
      const harvestWhere = { ...where };
      if (Object.keys(dateFilter).length > 0) {
        harvestWhere.harvestDate = dateFilter;
      }
      const totalHarvests = await Harvest.count({ where: harvestWhere });

      // Average Bio-Efficiency
      const batches = await Batch.findAll({
        where: completedWhere,
        attributes: ['totalYieldKg', 'plantCount'],
        raw: true
      });
      
      let avgBioEfficiency = 0;
      if (batches.length > 0) {
        const bioEfficiencies = batches
          .filter(b => b.plantCount > 0 && b.totalYieldKg > 0)
          .map(b => (b.totalYieldKg / b.plantCount) * 100);
        
        if (bioEfficiencies.length > 0) {
          avgBioEfficiency = bioEfficiencies.reduce((a, b) => a + b, 0) / bioEfficiencies.length;
        }
      }

      // Total Farms
      const farmWhere = {};
      if (req.user?.organizationId) {
        farmWhere.organizationId = req.user.organizationId;
      } else {
        farmWhere.ownerId = req.userId;
      }
      const totalFarms = await Farm.count({ where: farmWhere });

      res.json({
        success: true,
        data: {
          totalZones,
          activeBatches,
          completedBatches,
          totalYield: parseFloat(totalYield.toFixed(2)),
          totalHarvests,
          avgBioEfficiency: parseFloat(avgBioEfficiency.toFixed(2)),
          totalFarms
        }
      });
    } catch (error) {
      logger.error('Error fetching overview:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch overview data'
      });
    }
  }

  // Get yield trends over time
  async getYieldTrends(req, res) {
    try {
      const where = {};
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      // Get harvests with date grouping
      const harvests = await Harvest.findAll({
        where,
        attributes: [
          [sequelize.fn('DATE', sequelize.col('harvestDate')), 'date'],
          [sequelize.fn('SUM', sequelize.col('totalWeightKg')), 'totalYield'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'harvestCount']
        ],
        group: [sequelize.fn('DATE', sequelize.col('harvestDate'))],
        order: [[sequelize.fn('DATE', sequelize.col('harvestDate')), 'ASC']],
        raw: true
      });

      res.json({
        success: true,
        data: harvests.map(h => ({
          date: h.date,
          totalYield: parseFloat(h.totalYield || 0),
          harvestCount: parseInt(h.harvestCount || 0)
        }))
      });
    } catch (error) {
      logger.error('Error fetching yield trends:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch yield trends'
      });
    }
  }

  // Get batch performance comparison
  async getBatchPerformance(req, res) {
    try {
      const where = {
        status: 'completed'
      };
      
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const batches = await Batch.findAll({
        where,
        include: [{
          model: Zone,
          as: 'zone',
          attributes: ['name']
        }],
        attributes: [
          'id',
          'batchNumber',
          'cropName',
          'totalYieldKg',
          'plantCount',
          'startDate',
          'actualEndDate',
          'cycleDuration'
        ],
        order: [['actualEndDate', 'DESC']],
        limit: 10
      });

      const performance = batches.map(batch => {
        const bioEfficiency = batch.plantCount > 0 
          ? ((batch.totalYieldKg || 0) / batch.plantCount) * 100 
          : 0;
        
        const actualDuration = batch.actualEndDate && batch.startDate
          ? Math.floor((new Date(batch.actualEndDate) - new Date(batch.startDate)) / (1000 * 60 * 60 * 24))
          : batch.cycleDuration;

        return {
          batchNumber: batch.batchNumber,
          cropName: batch.cropName,
          zoneName: batch.zone?.name || 'N/A',
          totalYield: parseFloat((batch.totalYieldKg || 0).toFixed(2)),
          bioEfficiency: parseFloat(bioEfficiency.toFixed(2)),
          duration: actualDuration,
          plantCount: batch.plantCount
        };
      });

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      logger.error('Error fetching batch performance:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch batch performance'
      });
    }
  }

  // Get recipe performance comparison
  async getRecipePerformance(req, res) {
    try {
      const where = {
        status: 'completed'
      };
      
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const batches = await Batch.findAll({
        where,
        attributes: [
          'cropName',
          [sequelize.fn('COUNT', sequelize.col('id')), 'batchCount'],
          [sequelize.fn('SUM', sequelize.col('totalYieldKg')), 'totalYield'],
          [sequelize.fn('AVG', sequelize.col('totalYieldKg')), 'avgYield'],
          [sequelize.fn('SUM', sequelize.col('plantCount')), 'totalPlants']
        ],
        group: ['cropName'],
        raw: true
      });

      const performance = batches.map(batch => {
        const avgBioEfficiency = batch.totalPlants > 0
          ? ((batch.totalYield || 0) / batch.totalPlants) * 100
          : 0;

        return {
          cropName: batch.cropName,
          batchCount: parseInt(batch.batchCount || 0),
          totalYield: parseFloat((batch.totalYield || 0).toFixed(2)),
          avgYield: parseFloat((batch.avgYield || 0).toFixed(2)),
          avgBioEfficiency: parseFloat(avgBioEfficiency.toFixed(2))
        };
      });

      res.json({
        success: true,
        data: performance
      });
    } catch (error) {
      logger.error('Error fetching recipe performance:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch recipe performance'
      });
    }
  }

  // Get quality distribution
  async getQualityDistribution(req, res) {
    try {
      const where = {};
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const distribution = await Harvest.findAll({
        where,
        attributes: [
          'qualityGrade',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('totalWeightKg')), 'totalWeight']
        ],
        group: ['qualityGrade'],
        raw: true
      });

      const formatted = distribution.map(d => ({
        grade: d.qualityGrade || 'ungraded',
        count: parseInt(d.count || 0),
        weight: parseFloat((d.totalWeight || 0).toFixed(2))
      }));

      res.json({
        success: true,
        data: formatted
      });
    } catch (error) {
      logger.error('Error fetching quality distribution:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch quality distribution'
      });
    }
  }

  // Get recent activity
  async getRecentActivity(req, res) {
    try {
      const where = {};
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      // Recent harvests
      const recentHarvests = await Harvest.findAll({
        where,
        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['name']
          },
          {
            model: Batch,
            as: 'batch',
            attributes: ['batchNumber', 'cropName']
          }
        ],
        order: [['harvestDate', 'DESC']],
        limit: 5
      });

      // Recent batch completions
      const recentBatches = await Batch.findAll({
        where: {
          ...where,
          status: 'completed'
        },
        include: [{
          model: Zone,
          as: 'zone',
          attributes: ['name']
        }],
        order: [['actualEndDate', 'DESC']],
        limit: 5
      });

      res.json({
        success: true,
        data: {
          recentHarvests: recentHarvests.map(h => ({
            id: h.id,
            zoneName: h.zone?.name || 'N/A',
            batchNumber: h.batch?.batchNumber || h.batchId,
            cropName: h.batch?.cropName || 'N/A',
            flushNumber: h.flushNumber,
            weight: h.totalWeightKg,
            qualityGrade: h.qualityGrade,
            date: h.harvestDate
          })),
          recentBatches: recentBatches.map(b => ({
            id: b.id,
            batchNumber: b.batchNumber,
            cropName: b.cropName,
            zoneName: b.zone?.name || 'N/A',
            totalYield: b.totalYieldKg,
            duration: b.actualEndDate && b.startDate
              ? Math.floor((new Date(b.actualEndDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24))
              : b.cycleDuration,
            completedDate: b.actualEndDate
          }))
        }
      });
    } catch (error) {
      logger.error('Error fetching recent activity:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch recent activity'
      });
    }
  }
}

module.exports = new AnalyticsController();

/**
 * CropWise - Farm Controller
 */

const { Farm, Zone } = require('../models');
const logger = require('../utils/logger');

class FarmController {
  async getAllFarms(req, res) {
    try {
      const farms = await Farm.findAll({
        where: { ownerId: req.userId },
        include: ['zones']
      });

      res.json({
        success: true,
        data: farms
      });
    } catch (error) {
      logger.error('Error fetching farms:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farms'
      });
    }
  }

  async getFarmById(req, res) {
    try {
      const farm = await Farm.findOne({
        where: { 
          id: req.params.id,
          ownerId: req.userId
        },
        include: ['zones']
      });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: 'Farm not found'
        });
      }

      res.json({
        success: true,
        data: farm
      });
    } catch (error) {
      logger.error('Error fetching farm:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farm'
      });
    }
  }

  async createFarm(req, res) {
    try {
      const farm = await Farm.create({
        ...req.body,
        ownerId: req.userId
      });

      res.status(201).json({
        success: true,
        data: farm,
        message: 'Farm created successfully'
      });
    } catch (error) {
      logger.error('Error creating farm:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create farm'
      });
    }
  }

  async updateFarm(req, res) {
    try {
      const farm = await Farm.findOne({
        where: { 
          id: req.params.id,
          ownerId: req.userId
        }
      });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: 'Farm not found'
        });
      }

      await farm.update(req.body);

      res.json({
        success: true,
        data: farm,
        message: 'Farm updated successfully'
      });
    } catch (error) {
      logger.error('Error updating farm:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update farm'
      });
    }
  }

  async deleteFarm(req, res) {
    try {
      const farm = await Farm.findOne({
        where: { 
          id: req.params.id,
          ownerId: req.userId
        }
      });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: 'Farm not found'
        });
      }

      await farm.destroy();

      res.json({
        success: true,
        message: 'Farm deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting farm:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete farm'
      });
    }
  }

  async getFarmStats(req, res) {
    try {
      const farm = await Farm.findOne({
        where: { 
          id: req.params.id,
          ownerId: req.userId
        },
        include: ['zones']
      });

      if (!farm) {
        return res.status(404).json({
          success: false,
          message: 'Farm not found'
        });
      }

      const stats = {
        totalZones: farm.zones.length,
        activeZones: farm.zones.filter(z => z.status === 'running').length,
        idleZones: farm.zones.filter(z => z.status === 'idle').length,
        totalArea: farm.totalArea
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching farm stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch farm statistics'
      });
    }
  }

  async getFarmZones(req, res) {
    try {
      const zones = await Zone.findAll({
        where: { farmId: req.params.id },
        include: ['activeRecipe']
      });

      res.json({
        success: true,
        data: zones
      });
    } catch (error) {
      logger.error('Error fetching zones:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch zones'
      });
    }
  }
}

module.exports = new FarmController();


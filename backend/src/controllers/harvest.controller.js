/**
 * CropWise - Harvest Controller
 * Manages harvest recording and tracking
 */

const { Harvest, Zone, Batch, CropRecipe } = require('../models');
const logger = require('../utils/logger');

class HarvestController {
  // Record a new harvest
  async recordHarvest(req, res) {
    try {
      const harvestData = {
        ...req.body,
        ownerId: req.userId,
        organizationId: req.user?.organizationId || null,
        harvesterUserId: req.userId,
        harvesterName: `${req.user.firstName} ${req.user.lastName}`
      };

      const harvest = await Harvest.create(harvestData);

      // Update batch total yield
      if (harvest.batchId) {
        const batch = await Batch.findOne({ where: { batchNumber: harvest.batchId } });
        if (batch) {
          await batch.update({
            totalYieldKg: (batch.totalYieldKg || 0) + harvest.totalWeightKg,
            harvestCount: (batch.harvestCount || 0) + 1
          });
        }
      }

      res.status(201).json({
        success: true,
        data: harvest,
        message: 'Harvest recorded successfully'
      });
    } catch (error) {
      logger.error('Error recording harvest:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to record harvest',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Get all harvests with optional filters
  async getAllHarvests(req, res) {
    try {
      const where = {};
      
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      if (req.query.zoneId) {
        where.zoneId = req.query.zoneId;
      }

      if (req.query.batchId) {
        where.batchId = req.query.batchId;
      }

      const harvests = await Harvest.findAll({
        where,
        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name', 'zoneNumber']
          }
        ],
        order: [['harvestDate', 'DESC']]
      });

      res.json({
        success: true,
        data: harvests
      });
    } catch (error) {
      logger.error('Error fetching harvests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch harvests'
      });
    }
  }

  // Get single harvest by ID
  async getHarvestById(req, res) {
    try {
      const harvest = await Harvest.findByPk(req.params.id, {
        include: [
          {
            model: Zone,
            as: 'zone'
          }
        ]
      });

      if (!harvest) {
        return res.status(404).json({
          success: false,
          message: 'Harvest not found'
        });
      }

      // Verify access
      if (req.user?.organizationId) {
        if (harvest.organizationId !== req.user.organizationId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (harvest.ownerId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: harvest
      });
    } catch (error) {
      logger.error('Error fetching harvest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch harvest'
      });
    }
  }

  // Get harvests for a batch
  async getBatchHarvests(req, res) {
    try {
      const { batchId } = req.params;

      const harvests = await Harvest.findAll({
        where: { batchId },
        order: [['flushNumber', 'ASC'], ['harvestDate', 'ASC']]
      });

      // Calculate totals
      const totals = {
        totalWeight: harvests.reduce((sum, h) => sum + (h.totalWeightKg || 0), 0),
        totalBagsHarvested: harvests.reduce((sum, h) => sum + (h.bagsHarvested || 0), 0),
        totalBagsDiscarded: harvests.reduce((sum, h) => sum + (h.bagsDiscarded || 0), 0),
        flushCount: Math.max(...harvests.map(h => h.flushNumber), 0)
      };

      res.json({
        success: true,
        data: {
          harvests,
          totals
        }
      });
    } catch (error) {
      logger.error('Error fetching batch harvests:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch batch harvests'
      });
    }
  }

  // Update harvest
  async updateHarvest(req, res) {
    try {
      const harvest = await Harvest.findByPk(req.params.id);
      
      if (!harvest) {
        return res.status(404).json({
          success: false,
          message: 'Harvest not found'
        });
      }

      // Verify access
      if (req.user?.organizationId) {
        if (harvest.organizationId !== req.user.organizationId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (harvest.ownerId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await harvest.update(req.body);

      res.json({
        success: true,
        data: harvest,
        message: 'Harvest updated successfully'
      });
    } catch (error) {
      logger.error('Error updating harvest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update harvest'
      });
    }
  }

  // Delete harvest
  async deleteHarvest(req, res) {
    try {
      const harvest = await Harvest.findByPk(req.params.id);
      
      if (!harvest) {
        return res.status(404).json({
          success: false,
          message: 'Harvest not found'
        });
      }

      // Verify access
      if (req.user?.organizationId) {
        if (harvest.organizationId !== req.user.organizationId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (harvest.ownerId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await harvest.destroy();

      res.json({
        success: true,
        message: 'Harvest deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting harvest:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete harvest'
      });
    }
  }

  // Get harvest statistics
  async getHarvestStats(req, res) {
    try {
      const where = {};
      
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      if (req.query.zoneId) {
        where.zoneId = req.query.zoneId;
      }

      const harvests = await Harvest.findAll({ where });

      const stats = {
        totalHarvests: harvests.length,
        totalYieldKg: harvests.reduce((sum, h) => sum + (h.totalWeightKg || 0), 0),
        avgYieldPerHarvest: harvests.length > 0 
          ? harvests.reduce((sum, h) => sum + (h.totalWeightKg || 0), 0) / harvests.length 
          : 0,
        totalBagsHarvested: harvests.reduce((sum, h) => sum + (h.bagsHarvested || 0), 0),
        totalBagsDiscarded: harvests.reduce((sum, h) => sum + (h.bagsDiscarded || 0), 0),
        qualityDistribution: {
          premium: harvests.filter(h => h.qualityGrade === 'premium').length,
          grade_a: harvests.filter(h => h.qualityGrade === 'grade_a').length,
          grade_b: harvests.filter(h => h.qualityGrade === 'grade_b').length,
          rejected: harvests.filter(h => h.qualityGrade === 'rejected').length
        }
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      logger.error('Error fetching harvest stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch harvest statistics'
      });
    }
  }
}

module.exports = new HarvestController();


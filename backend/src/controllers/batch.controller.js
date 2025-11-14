/**
 * SmartCrop - Batch Controller
 * Manages growth cycle batches in zones
 */

const { Batch, Zone, CropRecipe } = require('../models');
const logger = require('../utils/logger');

class BatchController {
  constructor() {
    // Bind all methods to preserve 'this' context
    this.startBatch = this.startBatch.bind(this);
    this.completeBatch = this.completeBatch.bind(this);
    this.getAllBatches = this.getAllBatches.bind(this);
    this.getBatchById = this.getBatchById.bind(this);
    this.updateBatch = this.updateBatch.bind(this);
    this.getZoneBatchHistory = this.getZoneBatchHistory.bind(this);
    this.getActiveBatch = this.getActiveBatch.bind(this);
    this.generateBatchNumber = this.generateBatchNumber.bind(this);
  }

  // Start a new batch in a zone
  async startBatch(req, res) {
    try {
      const { zoneId, recipeId, plantCount, startDate, notes } = req.body;

      // Validate zone exists and user has access
      const where = { id: zoneId };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      }

      const zone = await Zone.findOne({ where });
      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      // Check if zone already has an active batch
      const activeBatch = await Batch.findOne({
        where: {
          zoneId,
          status: 'active'
        }
      });

      if (activeBatch) {
        return res.status(400).json({
          success: false,
          message: 'Zone already has an active batch. Please complete it first.'
        });
      }

      // Get recipe details
      const recipe = await CropRecipe.findByPk(recipeId);
      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }

      // Calculate expected end date
      const start = new Date(startDate || Date.now());
      const expectedEnd = new Date(start);
      expectedEnd.setDate(expectedEnd.getDate() + recipe.totalDuration);

      // Generate batch number
      const batchNumber = await this.generateBatchNumber(zone, start);

      // Create batch
      const batch = await Batch.create({
        batchNumber,
        ownerId: req.userId,
        organizationId: req.user?.organizationId || null,
        zoneId,
        recipeId,
        cropName: recipe.cropName,
        cropType: recipe.cropType,
        status: 'active',
        startDate: start,
        expectedEndDate: expectedEnd,
        cycleDuration: recipe.totalDuration,
        plantCount: plantCount || 0,
        currentStage: 0,
        notes
      });

      // Update zone
      await zone.update({
        activeRecipeId: recipeId,
        status: 'running',
        batchStartDate: start,
        batchEndDate: expectedEnd,
        plantCount: plantCount || 0,
        currentStage: 0
      });

      // Fetch complete batch data
      const completeBatch = await Batch.findByPk(batch.id, {
        include: [
          {
            model: CropRecipe,
            as: 'recipe',
            attributes: ['id', 'cropName', 'cropType', 'totalDuration']
          },
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name', 'zoneNumber']
          }
        ]
      });

      res.status(201).json({
        success: true,
        data: completeBatch,
        message: 'Batch started successfully'
      });
    } catch (error) {
      logger.error('Error starting batch:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to start batch',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // Complete/harvest a batch
  async completeBatch(req, res) {
    try {
      const { id } = req.params;
      const { notes, status, failureReason } = req.body;

      const batch = await Batch.findByPk(id, {
        include: [{
          model: Zone,
          as: 'zone'
        }]
      });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Verify access
      if (req.user?.organizationId) {
        if (batch.organizationId !== req.user.organizationId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (batch.ownerId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Update batch - totalYieldKg and harvestCount are already tracked from harvest records
      const updateData = {
        status: status || 'completed',
        actualEndDate: new Date()
      };
      
      if (notes) updateData.notes = notes;
      if (failureReason) updateData.failureReason = failureReason;
      
      await batch.update(updateData);

      // Update zone status to idle
      if (batch.zone) {
        await batch.zone.update({
          status: 'idle',
          activeRecipeId: null,
          batchStartDate: null,
          batchEndDate: null,
          currentStage: 0
        });
      }

      res.json({
        success: true,
        data: batch,
        message: 'Batch completed successfully'
      });
    } catch (error) {
      logger.error('Error completing batch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete batch'
      });
    }
  }

  // Get all batches (with optional zone filter)
  async getAllBatches(req, res) {
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

      if (req.query.status) {
        where.status = req.query.status;
      }

      const batches = await Batch.findAll({
        where,
        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name', 'zoneNumber']
          },
          {
            model: CropRecipe,
            as: 'recipe',
            attributes: ['id', 'cropName', 'cropType', 'totalDuration']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        data: batches
      });
    } catch (error) {
      logger.error('Error fetching batches:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch batches'
      });
    }
  }

  // Get single batch by ID
  async getBatchById(req, res) {
    try {
      const { id } = req.params;

      const batch = await Batch.findByPk(id, {
        include: [
          {
            model: Zone,
            as: 'zone'
          },
          {
            model: CropRecipe,
            as: 'recipe'
          }
        ]
      });

      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Verify access
      if (req.user?.organizationId) {
        if (batch.organizationId !== req.user.organizationId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (batch.ownerId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: batch
      });
    } catch (error) {
      logger.error('Error fetching batch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch batch'
      });
    }
  }

  // Update batch
  async updateBatch(req, res) {
    try {
      const { id } = req.params;

      const batch = await Batch.findByPk(id);
      if (!batch) {
        return res.status(404).json({
          success: false,
          message: 'Batch not found'
        });
      }

      // Verify access
      if (req.user?.organizationId) {
        if (batch.organizationId !== req.user.organizationId) {
          return res.status(403).json({
            success: false,
            message: 'Access denied'
          });
        }
      } else if (batch.ownerId !== req.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await batch.update(req.body);

      res.json({
        success: true,
        data: batch,
        message: 'Batch updated successfully'
      });
    } catch (error) {
      logger.error('Error updating batch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update batch'
      });
    }
  }

  // Get batch history for a zone
  async getZoneBatchHistory(req, res) {
    try {
      const { zoneId } = req.params;

      const batches = await Batch.findAll({
        where: { zoneId },
        include: [
          {
            model: CropRecipe,
            as: 'recipe',
            attributes: ['id', 'cropName', 'cropType', 'totalDuration']
          }
        ],
        order: [['startDate', 'DESC']]
      });

      res.json({
        success: true,
        data: batches
      });
    } catch (error) {
      logger.error('Error fetching batch history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch batch history'
      });
    }
  }

  // Get active batch for a zone
  async getActiveBatch(req, res) {
    try {
      const { zoneId } = req.params;

      const batch = await Batch.findOne({
        where: {
          zoneId,
          status: 'active'
        },
        include: [
          {
            model: CropRecipe,
            as: 'recipe'
          }
        ]
      });

      if (!batch) {
        return res.json({
          success: true,
          data: null,
          message: 'No active batch found'
        });
      }

      res.json({
        success: true,
        data: batch
      });
    } catch (error) {
      logger.error('Error fetching active batch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch active batch'
      });
    }
  }

  // Helper: Generate batch number
  async generateBatchNumber(zone, startDate) {
    const date = new Date(startDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    const zoneCode = zone.zoneNumber || zone.name.replace(/\s+/g, '-').toUpperCase();
    
    // Count batches for this zone this year
    const count = await Batch.count({
      where: {
        zoneId: zone.id,
        startDate: {
          [require('sequelize').Op.gte]: new Date(year, 0, 1)
        }
      }
    });

    const batchNum = String(count + 1).padStart(3, '0');
    
    return `${zoneCode}-${year}${month}${day}-${batchNum}`;
  }
}

module.exports = new BatchController();


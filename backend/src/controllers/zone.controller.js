/**
 * SmartCrop OS - Zone Controller
 */

const { Zone, Farm, CropRecipe, Device } = require('../models');
const logger = require('../utils/logger');

class ZoneController {
  // Get all zones for the current user
  async getAllZones(req, res) {
    try {
      const where = {};
      
      // Filter by organization or user
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }
      
      // Optional filter by farmId
      if (req.query.farmId) {
        where.farmId = req.query.farmId;
      }

      const zones = await Zone.findAll({
        where,
        include: [
          {
            model: Farm,
            as: 'farm',
            attributes: ['id', 'name'],
            required: false
          },
          {
            model: CropRecipe,
            as: 'activeRecipe',
            attributes: ['id', 'name', 'cropType'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']]
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

  // Get single zone by ID
  async getZoneById(req, res) {
    try {
      const where = { id: req.params.id };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const zone = await Zone.findOne({
        where,
        include: [
          {
            model: Farm,
            as: 'farm'
          },
          {
            model: CropRecipe,
            as: 'activeRecipe'
          },
          {
            model: Device,
            as: 'devices'
          }
        ]
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      res.json({
        success: true,
        data: zone
      });
    } catch (error) {
      logger.error('Error fetching zone:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch zone'
      });
    }
  }

  // Create new zone
  async createZone(req, res) {
    try {
      const zoneData = {
        ...req.body,
        ownerId: req.userId,
        organizationId: req.user?.organizationId || null,
        unitId: req.body.unitId || null
      };

      const zone = await Zone.create(zoneData);

      res.status(201).json({
        success: true,
        data: zone,
        message: 'Zone created successfully'
      });
    } catch (error) {
      logger.error('Error creating zone:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create zone'
      });
    }
  }

  // Update zone
  async updateZone(req, res) {
    try {
      const where = { id: req.params.id };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const zone = await Zone.findOne({ where });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      await zone.update(req.body);

      res.json({
        success: true,
        data: zone,
        message: 'Zone updated successfully'
      });
    } catch (error) {
      logger.error('Error updating zone:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update zone'
      });
    }
  }

  // Delete zone
  async deleteZone(req, res) {
    try {
      const where = { id: req.params.id };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const zone = await Zone.findOne({ where });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      await zone.destroy();

      res.json({
        success: true,
        message: 'Zone deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting zone:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete zone'
      });
    }
  }

  // Assign recipe to zone
  async assignRecipe(req, res) {
    try {
      const { recipeId } = req.body;
      
      const where = { id: req.params.id };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const zone = await Zone.findOne({ where });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      // Verify recipe exists
      const recipe = await CropRecipe.findByPk(recipeId);
      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }

      await zone.update({
        activeRecipeId: recipeId,
        currentStage: 0
      });

      res.json({
        success: true,
        data: zone,
        message: 'Recipe assigned successfully'
      });
    } catch (error) {
      logger.error('Error assigning recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign recipe'
      });
    }
  }

  // Start batch
  async startBatch(req, res) {
    try {
      const { plantCount, expectedHarvestDate } = req.body;
      
      const where = { id: req.params.id };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const zone = await Zone.findOne({ where });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      if (!zone.activeRecipeId) {
        return res.status(400).json({
          success: false,
          message: 'No recipe assigned to zone'
        });
      }

      await zone.update({
        status: 'running',
        batchStartDate: new Date(),
        batchEndDate: expectedHarvestDate,
        plantCount: plantCount || 0,
        currentStage: 0
      });

      res.json({
        success: true,
        data: zone,
        message: 'Batch started successfully'
      });
    } catch (error) {
      logger.error('Error starting batch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start batch'
      });
    }
  }

  // Stop batch
  async stopBatch(req, res) {
    try {
      const where = { id: req.params.id };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const zone = await Zone.findOne({ where });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      await zone.update({
        status: 'completed',
        batchEndDate: new Date()
      });

      res.json({
        success: true,
        data: zone,
        message: 'Batch stopped successfully'
      });
    } catch (error) {
      logger.error('Error stopping batch:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to stop batch'
      });
    }
  }

  // Get zone status
  async getZoneStatus(req, res) {
    try {
      const where = { id: req.params.id };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const zone = await Zone.findOne({
        where,
        include: [
          {
            model: CropRecipe,
            as: 'activeRecipe'
          }
        ]
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      const status = {
        zoneId: zone.id,
        status: zone.status,
        currentStage: zone.currentStage,
        batchStartDate: zone.batchStartDate,
        daysRunning: zone.batchStartDate 
          ? Math.floor((new Date() - new Date(zone.batchStartDate)) / (1000 * 60 * 60 * 24))
          : 0,
        plantCount: zone.plantCount,
        activeRecipe: zone.activeRecipe ? {
          id: zone.activeRecipe.id,
          name: zone.activeRecipe.name,
          cropType: zone.activeRecipe.cropType
        } : null,
        currentSetpoints: zone.currentSetpoints,
        lastEnvironmentData: zone.lastEnvironmentData
      };

      res.json({
        success: true,
        data: status
      });
    } catch (error) {
      logger.error('Error fetching zone status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch zone status'
      });
    }
  }

  // Get environment data
  async getEnvironmentData(req, res) {
    try {
      const where = { id: req.params.id };
      if (req.user?.organizationId) {
        where.organizationId = req.user.organizationId;
      } else {
        where.ownerId = req.userId;
      }

      const zone = await Zone.findOne({ where });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      // In production, this would fetch from time-series DB
      const data = {
        current: zone.lastEnvironmentData || {},
        setpoints: zone.currentSetpoints || {},
        history: [] // Would fetch from InfluxDB or similar
      };

      res.json({
        success: true,
        data
      });
    } catch (error) {
      logger.error('Error fetching environment data:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch environment data'
      });
    }
  }
}

module.exports = new ZoneController();

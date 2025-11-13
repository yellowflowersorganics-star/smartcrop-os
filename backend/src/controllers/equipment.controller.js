const { Equipment, ControlCommand, Zone, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const mqttControlService = require('../services/mqttControl.service');

class EquipmentController {
  constructor() {
    // Bind all methods
    this.getAllEquipment = this.getAllEquipment.bind(this);
    this.getEquipmentById = this.getEquipmentById.bind(this);
    this.getZoneEquipment = this.getZoneEquipment.bind(this);
    this.createEquipment = this.createEquipment.bind(this);
    this.updateEquipment = this.updateEquipment.bind(this);
    this.deleteEquipment = this.deleteEquipment.bind(this);
    this.sendControlCommand = this.sendControlCommand.bind(this);
    this.turnOn = this.turnOn.bind(this);
    this.turnOff = this.turnOff.bind(this);
    this.setValue = this.setValue.bind(this);
    this.setMode = this.setMode.bind(this);
    this.getCommandHistory = this.getCommandHistory.bind(this);
    this.getEquipmentStatus = this.getEquipmentStatus.bind(this);
  }

  /**
   * Get all equipment for user
   * @route GET /api/equipment
   */
  async getAllEquipment(req, res) {
    try {
      const { id: userId } = req.user;
      const { zoneId, type, status, mode } = req.query;

      const where = { ownerId: userId };
      if (zoneId) where.zoneId = zoneId;
      if (type) where.type = type;
      if (status) where.status = status;
      if (mode) where.mode = mode;

      const equipment = await Equipment.findAll({
        where,
        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name', 'type']
          }
        ],
        order: [['zoneId', 'ASC'], ['type', 'ASC'], ['name', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        count: equipment.length,
        equipment
      });
    } catch (error) {
      logger.error('Error fetching equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment',
        error: error.message
      });
    }
  }

  /**
   * Get equipment by ID
   * @route GET /api/equipment/:id
   */
  async getEquipmentById(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const equipment = await Equipment.findOne({
        where: { id, ownerId: userId },
        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name', 'type']
          },
          {
            model: ControlCommand,
            as: 'commands',
            limit: 10,
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }

      return res.status(200).json({
        success: true,
        equipment
      });
    } catch (error) {
      logger.error('Error fetching equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment',
        error: error.message
      });
    }
  }

  /**
   * Get all equipment for a specific zone
   * @route GET /api/equipment/zone/:zoneId
   */
  async getZoneEquipment(req, res) {
    try {
      const { zoneId } = req.params;
      const { id: userId } = req.user;

      const zone = await Zone.findOne({
        where: { id: zoneId, ownerId: userId }
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      const equipment = await Equipment.findAll({
        where: { zoneId, ownerId: userId },
        order: [['type', 'ASC'], ['name', 'ASC']]
      });

      return res.status(200).json({
        success: true,
        zone: {
          id: zone.id,
          name: zone.name,
          type: zone.type
        },
        count: equipment.length,
        equipment
      });
    } catch (error) {
      logger.error('Error fetching zone equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch zone equipment',
        error: error.message
      });
    }
  }

  /**
   * Create new equipment
   * @route POST /api/equipment
   */
  async createEquipment(req, res) {
    try {
      const { id: userId } = req.user;
      const {
        zoneId,
        deviceId,
        name,
        type,
        controlType,
        pin,
        minValue,
        maxValue,
        metadata
      } = req.body;

      // Verify zone ownership
      const zone = await Zone.findOne({
        where: { id: zoneId, ownerId: userId }
      });

      if (!zone) {
        return res.status(404).json({
          success: false,
          message: 'Zone not found'
        });
      }

      const equipment = await Equipment.create({
        zoneId,
        deviceId,
        name,
        type,
        controlType,
        pin,
        minValue: minValue || 0,
        maxValue: maxValue || 100,
        status: 'off',
        mode: 'auto',
        currentValue: 0,
        metadata: metadata || {},
        ownerId: userId
      });

      logger.info(`Equipment created: ${equipment.name} (${equipment.type}) in zone ${zone.name}`);

      return res.status(201).json({
        success: true,
        message: 'Equipment created successfully',
        equipment
      });
    } catch (error) {
      logger.error('Error creating equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to create equipment',
        error: error.message
      });
    }
  }

  /**
   * Update equipment
   * @route PUT /api/equipment/:id
   */
  async updateEquipment(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const updates = req.body;

      const equipment = await Equipment.findOne({
        where: { id, ownerId: userId }
      });

      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }

      // Don't allow changing critical fields via update
      delete updates.ownerId;
      delete updates.zoneId;

      await equipment.update(updates);

      logger.info(`Equipment updated: ${equipment.name} (${equipment.type})`);

      return res.status(200).json({
        success: true,
        message: 'Equipment updated successfully',
        equipment
      });
    } catch (error) {
      logger.error('Error updating equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to update equipment',
        error: error.message
      });
    }
  }

  /**
   * Delete equipment
   * @route DELETE /api/equipment/:id
   */
  async deleteEquipment(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const equipment = await Equipment.findOne({
        where: { id, ownerId: userId }
      });

      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }

      await equipment.destroy();

      logger.info(`Equipment deleted: ${equipment.name} (${equipment.type})`);

      return res.status(200).json({
        success: true,
        message: 'Equipment deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting equipment:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete equipment',
        error: error.message
      });
    }
  }

  /**
   * Send control command to equipment
   * @route POST /api/equipment/:id/command
   */
  async sendControlCommand(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const { commandType, value, mode } = req.body;

      const equipment = await Equipment.findOne({
        where: { id, ownerId: userId },
        include: [{ model: Zone, as: 'zone' }]
      });

      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }

      // Create command record
      const command = await ControlCommand.create({
        equipmentId: equipment.id,
        zoneId: equipment.zoneId,
        commandType,
        value,
        mode,
        source: 'user',
        status: 'pending',
        userId,
        ownerId: userId
      });

      // Send command via MQTT
      const result = await mqttControlService.sendCommand(equipment, command);

      if (result.success) {
        // Update equipment status
        const updates = { lastCommandTime: new Date() };
        
        if (commandType === 'turn_on') {
          updates.status = 'on';
          updates.currentValue = equipment.maxValue;
        } else if (commandType === 'turn_off') {
          updates.status = 'off';
          updates.currentValue = 0;
        } else if (commandType === 'set_value' && value !== undefined) {
          updates.currentValue = value;
          updates.status = value > 0 ? 'on' : 'off';
        } else if (commandType === 'set_mode' && mode) {
          updates.mode = mode;
        }

        await equipment.update(updates);
        await command.update({ status: 'sent', sentAt: new Date() });

        logger.info(`Command sent: ${commandType} to ${equipment.name}`);

        return res.status(200).json({
          success: true,
          message: 'Command sent successfully',
          command,
          equipment: await Equipment.findByPk(equipment.id)
        });
      } else {
        await command.update({ 
          status: 'failed', 
          errorMessage: result.error 
        });

        return res.status(500).json({
          success: false,
          message: 'Failed to send command',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error sending control command:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send control command',
        error: error.message
      });
    }
  }

  /**
   * Turn equipment ON
   * @route POST /api/equipment/:id/on
   */
  async turnOn(req, res) {
    req.body = { commandType: 'turn_on' };
    return this.sendControlCommand(req, res);
  }

  /**
   * Turn equipment OFF
   * @route POST /api/equipment/:id/off
   */
  async turnOff(req, res) {
    req.body = { commandType: 'turn_off' };
    return this.sendControlCommand(req, res);
  }

  /**
   * Set equipment value (e.g., fan speed)
   * @route POST /api/equipment/:id/value
   */
  async setValue(req, res) {
    const { value } = req.body;
    
    if (value === undefined || value === null) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }

    req.body = { commandType: 'set_value', value: parseInt(value) };
    return this.sendControlCommand(req, res);
  }

  /**
   * Set equipment mode (manual/auto)
   * @route POST /api/equipment/:id/mode
   */
  async setMode(req, res) {
    const { mode } = req.body;
    
    if (!mode || !['manual', 'auto', 'scheduled'].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Valid mode is required (manual, auto, scheduled)'
      });
    }

    req.body = { commandType: 'set_mode', mode };
    return this.sendControlCommand(req, res);
  }

  /**
   * Get command history for equipment
   * @route GET /api/equipment/:id/commands
   */
  async getCommandHistory(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const { limit = 50, status, source } = req.query;

      const equipment = await Equipment.findOne({
        where: { id, ownerId: userId }
      });

      if (!equipment) {
        return res.status(404).json({
          success: false,
          message: 'Equipment not found'
        });
      }

      const where = { equipmentId: id };
      if (status) where.status = status;
      if (source) where.source = source;

      const commands = await ControlCommand.findAll({
        where,
        include: [
          {
            model: User,
            as: 'initiator',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        limit: parseInt(limit),
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: commands.length,
        commands
      });
    } catch (error) {
      logger.error('Error fetching command history:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch command history',
        error: error.message
      });
    }
  }

  /**
   * Get current status of all equipment
   * @route GET /api/equipment/status/all
   */
  async getEquipmentStatus(req, res) {
    try {
      const { id: userId } = req.user;
      const { zoneId } = req.query;

      const where = { ownerId: userId, isActive: true };
      if (zoneId) where.zoneId = zoneId;

      const equipment = await Equipment.findAll({
        where,
        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name']
          }
        ],
        attributes: [
          'id',
          'name',
          'type',
          'status',
          'mode',
          'currentValue',
          'targetValue',
          'lastStatusUpdate',
          'zoneId'
        ],
        order: [['zoneId', 'ASC'], ['type', 'ASC']]
      });

      // Group by zone
      const byZone = equipment.reduce((acc, eq) => {
        const zoneName = eq.zone?.name || 'Unknown';
        if (!acc[zoneName]) {
          acc[zoneName] = [];
        }
        acc[zoneName].push({
          id: eq.id,
          name: eq.name,
          type: eq.type,
          status: eq.status,
          mode: eq.mode,
          currentValue: eq.currentValue,
          targetValue: eq.targetValue,
          lastUpdate: eq.lastStatusUpdate
        });
        return acc;
      }, {});

      return res.status(200).json({
        success: true,
        totalEquipment: equipment.length,
        byZone
      });
    } catch (error) {
      logger.error('Error fetching equipment status:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch equipment status',
        error: error.message
      });
    }
  }
}

module.exports = new EquipmentController();


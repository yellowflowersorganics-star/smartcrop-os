/**
 * Yellow Flowers SmartFarm Cloud - Unit Routes
 * API endpoints for managing units (buildings/locations)
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { checkTenant } = require('../middleware/tenantContext');
const { Unit, Zone, Device, Organization } = require('../models');
const { Op } = require('sequelize');

/**
 * @route   GET /api/units
 * @desc    Get all units for organization
 * @access  Private
 */
router.get('/', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;

    const units = await Unit.findAll({
      where: { organizationId },
      include: [
        {
          model: Zone,
          as: 'zones',
          attributes: ['id', 'name', 'status']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: units,
      count: units.length
    });
  } catch (error) {
    console.error('Error fetching units:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch units'
    });
  }
});

/**
 * @route   GET /api/units/:id
 * @desc    Get single unit with details
 * @access  Private
 */
router.get('/:id', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { id } = req.params;

    const unit = await Unit.findOne({
      where: { 
        id,
        organizationId
      },
      include: [
        {
          model: Zone,
          as: 'zones',
          include: [
            {
              model: Device,
              as: 'devices'
            }
          ]
        },
        {
          model: Device,
          as: 'devices',
          where: { deviceType: 'raspberry_pi_gateway' },
          required: false
        }
      ]
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    res.json({
      success: true,
      data: unit
    });
  } catch (error) {
    console.error('Error fetching unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unit'
    });
  }
});

/**
 * @route   POST /api/units
 * @desc    Create new unit
 * @access  Private
 */
router.post('/', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const {
      name,
      unitCode,
      location,
      unitType,
      totalArea,
      gatewayId,
      networkConfig,
      contactPerson,
      contactPhone
    } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Unit name is required'
      });
    }

    // Check if gatewayId is already registered
    if (gatewayId) {
      const existing = await Unit.findOne({ where: { gatewayId } });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Gateway ID already registered to another unit'
        });
      }
    }

    const unit = await Unit.create({
      organizationId,
      name,
      unitCode,
      location,
      unitType: unitType || 'building',
      totalArea,
      gatewayId,
      gatewayStatus: gatewayId ? 'offline' : null,
      networkConfig: networkConfig || {},
      contactPerson,
      contactPhone,
      status: 'active'
    });

    // Also create a Device entry for the Raspberry Pi if gatewayId provided
    if (gatewayId) {
      await Device.create({
        organizationId,
        unitId: unit.id,
        deviceId: gatewayId,
        deviceType: 'raspberry_pi_gateway',
        name: `${name} - Gateway`,
        status: 'offline'
      });
    }

    res.status(201).json({
      success: true,
      data: unit,
      message: 'Unit created successfully'
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create unit'
    });
  }
});

/**
 * @route   PUT /api/units/:id
 * @desc    Update unit
 * @access  Private
 */
router.put('/:id', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { id } = req.params;

    const unit = await Unit.findOne({
      where: { id, organizationId }
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    const {
      name,
      unitCode,
      location,
      unitType,
      totalArea,
      gatewayId,
      networkConfig,
      contactPerson,
      contactPhone,
      status
    } = req.body;

    // Check if new gatewayId conflicts
    if (gatewayId && gatewayId !== unit.gatewayId) {
      const existing = await Unit.findOne({ where: { gatewayId } });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Gateway ID already registered to another unit'
        });
      }
    }

    await unit.update({
      name: name || unit.name,
      unitCode: unitCode !== undefined ? unitCode : unit.unitCode,
      location: location || unit.location,
      unitType: unitType || unit.unitType,
      totalArea: totalArea !== undefined ? totalArea : unit.totalArea,
      gatewayId: gatewayId !== undefined ? gatewayId : unit.gatewayId,
      networkConfig: networkConfig || unit.networkConfig,
      contactPerson: contactPerson !== undefined ? contactPerson : unit.contactPerson,
      contactPhone: contactPhone !== undefined ? contactPhone : unit.contactPhone,
      status: status || unit.status
    });

    res.json({
      success: true,
      data: unit,
      message: 'Unit updated successfully'
    });
  } catch (error) {
    console.error('Error updating unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update unit'
    });
  }
});

/**
 * @route   DELETE /api/units/:id
 * @desc    Delete unit (soft delete by setting status)
 * @access  Private
 */
router.delete('/:id', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { id } = req.params;

    const unit = await Unit.findOne({
      where: { id, organizationId }
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    // Check if unit has active zones
    const activeZones = await Zone.count({
      where: {
        unitId: id,
        status: { [Op.in]: ['running', 'ready'] }
      }
    });

    if (activeZones > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete unit with ${activeZones} active zones. Stop all zones first.`
      });
    }

    // Soft delete
    await unit.update({ status: 'decommissioned' });

    res.json({
      success: true,
      message: 'Unit decommissioned successfully'
    });
  } catch (error) {
    console.error('Error deleting unit:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete unit'
    });
  }
});

/**
 * @route   POST /api/units/:id/gateway-heartbeat
 * @desc    Update gateway status (called by Raspberry Pi)
 * @access  Private (Gateway authentication)
 */
router.post('/:id/gateway-heartbeat', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      gatewayId,
      ipAddress,
      version,
      zoneStatuses,
      systemInfo
    } = req.body;

    const unit = await Unit.findOne({
      where: { id, gatewayId }
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found or gateway mismatch'
      });
    }

    await unit.update({
      gatewayStatus: 'online',
      gatewayLastSeen: new Date(),
      gatewayIpAddress: ipAddress,
      gatewayVersion: version,
      metadata: {
        ...unit.metadata,
        lastHeartbeat: new Date().toISOString(),
        systemInfo
      }
    });

    // Update zone device statuses if provided
    if (zoneStatuses && Array.isArray(zoneStatuses)) {
      for (const zoneStatus of zoneStatuses) {
        await Device.update(
          { 
            status: zoneStatus.status,
            lastSeen: new Date()
          },
          { 
            where: { 
              deviceId: zoneStatus.esp32Id,
              unitId: id
            }
          }
        );
      }
    }

    res.json({
      success: true,
      message: 'Heartbeat received',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing heartbeat:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process heartbeat'
    });
  }
});

/**
 * @route   GET /api/units/:id/statistics
 * @desc    Get unit statistics (zones, devices, uptime)
 * @access  Private
 */
router.get('/:id/statistics', authenticate, checkTenant, async (req, res) => {
  try {
    const { organizationId } = req.tenant;
    const { id } = req.params;

    const unit = await Unit.findOne({
      where: { id, organizationId }
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        error: 'Unit not found'
      });
    }

    // Get zone statistics
    const zoneStats = await Zone.findAll({
      where: { unitId: id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status'],
      raw: true
    });

    // Get device statistics
    const deviceStats = await Device.findAll({
      where: { unitId: id },
      attributes: [
        'status',
        'deviceType',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['status', 'deviceType'],
      raw: true
    });

    // Calculate gateway uptime
    const gatewayOnline = unit.isGatewayOnline();
    
    res.json({
      success: true,
      data: {
        unit: {
          id: unit.id,
          name: unit.name,
          status: unit.status,
          totalZones: unit.totalZones,
          activeZones: unit.activeZones
        },
        gateway: {
          status: unit.gatewayStatus,
          online: gatewayOnline,
          lastSeen: unit.gatewayLastSeen,
          version: unit.gatewayVersion
        },
        zones: zoneStats,
        devices: deviceStats
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;


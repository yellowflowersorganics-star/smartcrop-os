/**
 * Alert & Notification Controller
 * Handles alerts, notifications, and notification preferences
 */

const { Alert, NotificationPreference, Zone, Batch, InventoryItem, Device, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AlertController {
  constructor() {
    // Bind methods to maintain context
    this.getAllAlerts = this.getAllAlerts.bind(this);
    this.getAlertById = this.getAlertById.bind(this);
    this.createAlert = this.createAlert.bind(this);
    this.updateAlert = this.updateAlert.bind(this);
    this.deleteAlert = this.deleteAlert.bind(this);
    this.markAsRead = this.markAsRead.bind(this);
    this.markAsUnread = this.markAsUnread.bind(this);
    this.dismiss = this.dismiss.bind(this);
    this.acknowledge = this.acknowledge.bind(this);
    this.markAllAsRead = this.markAllAsRead.bind(this);
    this.dismissAll = this.dismissAll.bind(this);
    this.getUnreadCount = this.getUnreadCount.bind(this);
    this.getPreferences = this.getPreferences.bind(this);
    this.updatePreferences = this.updatePreferences.bind(this);
    // Alert generation methods
    this.generateEnvironmentalAlert = this.generateEnvironmentalAlert.bind(this);
    this.generateInventoryAlert = this.generateInventoryAlert.bind(this);
    this.generateBatchMilestoneAlert = this.generateBatchMilestoneAlert.bind(this);
  }

  /**
   * Get all alerts for user with filtering
   */
  async getAllAlerts(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { 
        type, 
        severity, 
        status, 
        page = 1, 
        limit = 50,
        startDate,
        endDate
      } = req.query;

      const where = {
        userId
      };

      if (type) {
        where.type = type;
      }

      if (severity) {
        where.severity = severity;
      }

      if (status) {
        where.status = status;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      const offset = (page - 1) * limit;

      const { rows: alerts, count: total } = await Alert.findAndCountAll({
        where,
        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name', 'zoneNumber'],
            required: false
          },
          {
            model: Batch,
            as: 'batch',
            attributes: ['batchNumber', 'status', 'cropName'],
            required: false
          },
          {
            model: InventoryItem,
            as: 'inventoryItem',
            attributes: ['id', 'name', 'currentStock', 'minStockLevel', 'unit'],
            required: false
          },
          {
            model: Device,
            as: 'device',
            attributes: ['id', 'name', 'deviceId', 'status'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      logger.info(`Retrieved ${alerts.length} alerts for user ${userId}`);

      res.json({
        alerts,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  /**
   * Get single alert by ID
   */
  async getAlertById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const alert = await Alert.findOne({
        where: { id, userId },
        include: [
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: InventoryItem, as: 'inventoryItem', required: false },
          { model: Device, as: 'device', required: false }
        ]
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      res.json(alert);
    } catch (error) {
      logger.error('Error fetching alert:', error);
      res.status(500).json({ error: 'Failed to fetch alert' });
    }
  }

  /**
   * Create new alert
   */
  async createAlert(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const alertData = {
        ...req.body,
        userId,
        organizationId: organizationId || null
      };

      const alert = await Alert.create(alertData);

      logger.info(`Created alert ${alert.id} for user ${userId}`);

      res.status(201).json(alert);
    } catch (error) {
      logger.error('Error creating alert:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to create alert' });
    }
  }

  /**
   * Update alert
   */
  async updateAlert(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const alert = await Alert.findOne({
        where: { id, userId }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      await alert.update(req.body);

      logger.info(`Updated alert ${id}`);

      res.json(alert);
    } catch (error) {
      logger.error('Error updating alert:', error);
      res.status(500).json({ error: 'Failed to update alert' });
    }
  }

  /**
   * Delete alert
   */
  async deleteAlert(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const alert = await Alert.findOne({
        where: { id, userId }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      await alert.destroy();

      logger.info(`Deleted alert ${id}`);

      res.json({ message: 'Alert deleted successfully' });
    } catch (error) {
      logger.error('Error deleting alert:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  }

  /**
   * Mark alert as read
   */
  async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const alert = await Alert.findOne({
        where: { id, userId }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      await alert.update({
        status: 'read',
        readAt: new Date()
      });

      logger.info(`Marked alert ${id} as read`);

      res.json(alert);
    } catch (error) {
      logger.error('Error marking alert as read:', error);
      res.status(500).json({ error: 'Failed to mark alert as read' });
    }
  }

  /**
   * Mark alert as unread
   */
  async markAsUnread(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const alert = await Alert.findOne({
        where: { id, userId }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      await alert.update({
        status: 'unread',
        readAt: null
      });

      logger.info(`Marked alert ${id} as unread`);

      res.json(alert);
    } catch (error) {
      logger.error('Error marking alert as unread:', error);
      res.status(500).json({ error: 'Failed to mark alert as unread' });
    }
  }

  /**
   * Dismiss alert
   */
  async dismiss(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const alert = await Alert.findOne({
        where: { id, userId }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      await alert.update({
        status: 'dismissed',
        dismissedAt: new Date()
      });

      logger.info(`Dismissed alert ${id}`);

      res.json(alert);
    } catch (error) {
      logger.error('Error dismissing alert:', error);
      res.status(500).json({ error: 'Failed to dismiss alert' });
    }
  }

  /**
   * Acknowledge alert
   */
  async acknowledge(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const alert = await Alert.findOne({
        where: { id, userId }
      });

      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }

      await alert.update({
        status: 'acknowledged',
        acknowledgedAt: new Date(),
        acknowledgedBy: userId
      });

      logger.info(`Acknowledged alert ${id}`);

      res.json(alert);
    } catch (error) {
      logger.error('Error acknowledging alert:', error);
      res.status(500).json({ error: 'Failed to acknowledge alert' });
    }
  }

  /**
   * Mark all alerts as read
   */
  async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      const result = await Alert.update(
        {
          status: 'read',
          readAt: new Date()
        },
        {
          where: {
            userId,
            status: 'unread'
          }
        }
      );

      logger.info(`Marked all alerts as read for user ${userId}`);

      res.json({ message: 'All alerts marked as read', count: result[0] });
    } catch (error) {
      logger.error('Error marking all alerts as read:', error);
      res.status(500).json({ error: 'Failed to mark all alerts as read' });
    }
  }

  /**
   * Dismiss all read alerts
   */
  async dismissAll(req, res) {
    try {
      const userId = req.user.id;

      const result = await Alert.update(
        {
          status: 'dismissed',
          dismissedAt: new Date()
        },
        {
          where: {
            userId,
            status: 'read'
          }
        }
      );

      logger.info(`Dismissed all read alerts for user ${userId}`);

      res.json({ message: 'All read alerts dismissed', count: result[0] });
    } catch (error) {
      logger.error('Error dismissing all alerts:', error);
      res.status(500).json({ error: 'Failed to dismiss all alerts' });
    }
  }

  /**
   * Get unread alert count
   */
  async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await Alert.count({
        where: {
          userId,
          status: 'unread'
        }
      });

      res.json({ count });
    } catch (error) {
      logger.error('Error fetching unread count:', error);
      res.status(500).json({ error: 'Failed to fetch unread count' });
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(req, res) {
    try {
      const userId = req.user.id;

      let preferences = await NotificationPreference.findOne({
        where: { userId }
      });

      // Create default preferences if they don't exist
      if (!preferences) {
        preferences = await NotificationPreference.create({ userId });
      }

      res.json(preferences);
    } catch (error) {
      logger.error('Error fetching notification preferences:', error);
      res.status(500).json({ error: 'Failed to fetch notification preferences' });
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(req, res) {
    try {
      const userId = req.user.id;

      let preferences = await NotificationPreference.findOne({
        where: { userId }
      });

      if (!preferences) {
        preferences = await NotificationPreference.create({
          userId,
          ...req.body
        });
      } else {
        await preferences.update(req.body);
      }

      logger.info(`Updated notification preferences for user ${userId}`);

      res.json(preferences);
    } catch (error) {
      logger.error('Error updating notification preferences:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to update notification preferences' });
    }
  }

  /**
   * Generate environmental alert (called from telemetry service)
   */
  async generateEnvironmentalAlert(userId, zoneId, parameter, value, thresholds, metadata = {}) {
    try {
      // Check if similar alert already exists recently (avoid spam)
      const recentAlert = await Alert.findOne({
        where: {
          userId,
          zoneId,
          type: 'environmental',
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 60 * 1000) // Last 30 minutes
          },
          'metadata.parameter': parameter
        }
      });

      if (recentAlert) {
        logger.info('Similar environmental alert exists, skipping');
        return recentAlert;
      }

      const zone = await Zone.findByPk(zoneId);
      let severity = 'medium';
      let message = '';

      // Determine severity and message
      if (value < thresholds.min) {
        const diff = ((thresholds.min - value) / thresholds.min * 100).toFixed(1);
        message = `${parameter} is ${diff}% below minimum threshold in ${zone?.name || 'zone'}`;
        severity = diff > 20 ? 'high' : 'medium';
      } else if (value > thresholds.max) {
        const diff = ((value - thresholds.max) / thresholds.max * 100).toFixed(1);
        message = `${parameter} is ${diff}% above maximum threshold in ${zone?.name || 'zone'}`;
        severity = diff > 20 ? 'high' : 'medium';
      }

      const alert = await Alert.create({
        userId,
        type: 'environmental',
        severity,
        title: `${parameter} Out of Range`,
        message,
        zoneId,
        actionUrl: `/zones/${zoneId}`,
        actionLabel: 'View Zone',
        metadata: {
          parameter,
          value,
          thresholds,
          ...metadata
        }
      });

      logger.info(`Generated environmental alert for zone ${zoneId}: ${parameter}`);
      return alert;
    } catch (error) {
      logger.error('Error generating environmental alert:', error);
      throw error;
    }
  }

  /**
   * Generate inventory alert (called from inventory service)
   */
  async generateInventoryAlert(userId, itemId, item) {
    try {
      // Check if similar alert already exists recently
      const recentAlert = await Alert.findOne({
        where: {
          userId,
          inventoryItemId: itemId,
          type: 'inventory',
          status: { [Op.in]: ['unread', 'read'] }
        }
      });

      if (recentAlert) {
        logger.info('Similar inventory alert exists, skipping');
        return recentAlert;
      }

      const percentRemaining = (item.currentStock / item.minStockLevel * 100).toFixed(0);
      let severity = 'low';
      
      if (percentRemaining <= 50) severity = 'high';
      else if (percentRemaining <= 80) severity = 'medium';

      const alert = await Alert.create({
        userId,
        type: 'inventory',
        severity,
        title: 'Low Stock Alert',
        message: `${item.name} is running low. Current: ${item.currentStock} ${item.unit}, Minimum: ${item.minStockLevel} ${item.unit}`,
        inventoryItemId: itemId,
        actionUrl: '/inventory?lowStock=true',
        actionLabel: 'View Inventory',
        metadata: {
          itemName: item.name,
          currentStock: item.currentStock,
          minStockLevel: item.minStockLevel,
          unit: item.unit
        }
      });

      logger.info(`Generated inventory alert for item ${itemId}`);
      return alert;
    } catch (error) {
      logger.error('Error generating inventory alert:', error);
      throw error;
    }
  }

  /**
   * Generate batch milestone alert
   */
  async generateBatchMilestoneAlert(userId, batchId, milestone, message, severity = 'medium') {
    try {
      const batch = await Batch.findOne({
        where: { batchNumber: batchId }
      });

      if (!batch) {
        throw new Error('Batch not found');
      }

      const alert = await Alert.create({
        userId,
        type: 'batch_milestone',
        severity,
        title: `Batch ${milestone}`,
        message,
        batchId,
        zoneId: batch.zoneId,
        actionUrl: `/zones/${batch.zoneId}`,
        actionLabel: 'View Zone',
        metadata: {
          milestone,
          batchNumber: batchId,
          cropName: batch.cropName
        }
      });

      logger.info(`Generated batch milestone alert for batch ${batchId}: ${milestone}`);
      return alert;
    } catch (error) {
      logger.error('Error generating batch milestone alert:', error);
      throw error;
    }
  }
}

module.exports = new AlertController();


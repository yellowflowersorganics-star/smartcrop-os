/**
 * Alert Generation Service
 * Background service for generating alerts based on system events
 */

const { Alert, NotificationPreference, Zone, Telemetry, InventoryItem, Batch, CropRecipe } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class AlertService {
  /**
   * Check environmental data and generate alerts if needed
   */
  async checkEnvironmentalData(zoneId, telemetryData) {
    try {
      const zone = await Zone.findByPk(zoneId, {
        include: [
          {
            model: CropRecipe,
            as: 'activeRecipe',
            required: false
          }
        ]
      });

      if (!zone || !zone.activeRecipe) {
        return; // No active recipe, can't check thresholds
      }

      const recipe = zone.activeRecipe;
      const currentStage = recipe.stages[zone.currentStage];

      if (!currentStage || !currentStage.environmental) {
        return; // No environmental parameters defined
      }

      const params = currentStage.environmental;
      const alerts = [];

      // Check each environmental parameter
      for (const [param, value] of Object.entries(telemetryData)) {
        if (!value || !params[param]) continue;

        const threshold = params[param];
        let min, max;

        // Handle both object and number formats
        if (typeof threshold === 'object') {
          min = threshold.min;
          max = threshold.max;
        } else {
          // If just a number, use +/- 10% as range
          min = threshold * 0.9;
          max = threshold * 1.1;
        }

        // Check if value is out of range
        if (value < min || value > max) {
          const alert = await this.generateEnvironmentalAlert(
            zone.ownerId,
            zoneId,
            param,
            value,
            { min, max, optimal: threshold.optimal || threshold }
          );
          if (alert) alerts.push(alert);
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Error checking environmental data:', error);
      throw error;
    }
  }

  /**
   * Generate environmental alert
   */
  async generateEnvironmentalAlert(userId, zoneId, parameter, value, thresholds) {
    try {
      // Check if similar alert exists in last 30 minutes (avoid spam)
      const recentAlert = await Alert.findOne({
        where: {
          userId,
          zoneId,
          type: 'environmental',
          status: { [Op.in]: ['unread', 'read'] },
          createdAt: {
            [Op.gte]: new Date(Date.now() - 30 * 60 * 1000)
          }
        },
        order: [['createdAt', 'DESC']]
      });

      // If similar alert exists, update it instead of creating new one
      if (recentAlert && recentAlert.metadata?.parameter === parameter) {
        await recentAlert.update({
          metadata: {
            ...recentAlert.metadata,
            value,
            thresholds,
            updatedAt: new Date()
          }
        });
        logger.info(`Updated existing environmental alert for zone ${zoneId}: ${parameter}`);
        return recentAlert;
      }

      const zone = await Zone.findByPk(zoneId);
      let severity = 'medium';
      let message = '';

      // Determine severity and message
      if (value < thresholds.min) {
        const diff = ((thresholds.min - value) / thresholds.min * 100).toFixed(1);
        message = `${this.formatParameterName(parameter)} is ${diff}% below minimum (${value.toFixed(1)} < ${thresholds.min})`;
        severity = diff > 20 ? 'high' : 'medium';
      } else if (value > thresholds.max) {
        const diff = ((value - thresholds.max) / thresholds.max * 100).toFixed(1);
        message = `${this.formatParameterName(parameter)} is ${diff}% above maximum (${value.toFixed(1)} > ${thresholds.max})`;
        severity = diff > 20 ? 'high' : 'medium';
      }

      const alert = await Alert.create({
        userId,
        type: 'environmental',
        severity,
        title: `Environmental Alert: ${zone?.name || 'Zone'}`,
        message,
        zoneId,
        actionUrl: `/zones/${zoneId}`,
        actionLabel: 'View Zone',
        metadata: {
          parameter,
          value,
          thresholds,
          zoneName: zone?.name
        }
      });

      logger.info(`Generated environmental alert for zone ${zoneId}: ${parameter}`);
      return alert;
    } catch (error) {
      logger.error('Error generating environmental alert:', error);
      return null;
    }
  }

  /**
   * Check inventory levels and generate alerts
   */
  async checkInventoryLevels() {
    try {
      const lowStockItems = await InventoryItem.findAll({
        where: {
          isActive: true,
          minStockLevel: { [Op.not]: null }
        }
      });

      const alerts = [];

      for (const item of lowStockItems) {
        if (item.currentStock <= item.minStockLevel) {
          // Check if alert already exists
          const existingAlert = await Alert.findOne({
            where: {
              userId: item.ownerId,
              inventoryItemId: item.id,
              type: 'inventory',
              status: { [Op.in]: ['unread', 'read'] }
            }
          });

          if (!existingAlert) {
            const alert = await this.generateInventoryAlert(item.ownerId, item);
            if (alert) alerts.push(alert);
          }
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Error checking inventory levels:', error);
      throw error;
    }
  }

  /**
   * Generate inventory alert
   */
  async generateInventoryAlert(userId, item) {
    try {
      const percentRemaining = (item.currentStock / item.minStockLevel * 100);
      let severity = 'low';
      
      if (percentRemaining <= 50) severity = 'high';
      else if (percentRemaining <= 80) severity = 'medium';

      const alert = await Alert.create({
        userId,
        type: 'inventory',
        severity,
        title: 'Low Stock Alert',
        message: `${item.name} is running low. Current: ${item.currentStock} ${item.unit}, Minimum: ${item.minStockLevel} ${item.unit}`,
        inventoryItemId: item.id,
        actionUrl: '/inventory?lowStock=true',
        actionLabel: 'Restock Now',
        metadata: {
          itemName: item.name,
          currentStock: item.currentStock,
          minStockLevel: item.minStockLevel,
          unit: item.unit,
          percentRemaining: percentRemaining.toFixed(1)
        }
      });

      logger.info(`Generated inventory alert for item ${item.id}: ${item.name}`);
      return alert;
    } catch (error) {
      logger.error('Error generating inventory alert:', error);
      return null;
    }
  }

  /**
   * Check batch milestones and generate alerts
   */
  async checkBatchMilestones() {
    try {
      const activeBatches = await Batch.findAll({
        where: {
          status: 'active'
        },
        include: [
          {
            model: CropRecipe,
            as: 'recipe',
            required: false
          }
        ]
      });

      const alerts = [];

      for (const batch of activeBatches) {
        // Check if batch is ready for harvest
        const daysRunning = Math.floor((new Date() - new Date(batch.startDate)) / (1000 * 60 * 60 * 24));
        const expectedDuration = batch.cycleDuration;

        if (daysRunning >= expectedDuration - 2 && daysRunning <= expectedDuration + 2) {
          // Check if alert already sent
          const existingAlert = await Alert.findOne({
            where: {
              userId: batch.ownerId,
              batchId: batch.batchNumber,
              type: 'harvest_reminder',
              createdAt: {
                [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          });

          if (!existingAlert) {
            const alert = await this.generateHarvestReminderAlert(batch);
            if (alert) alerts.push(alert);
          }
        }

        // Check stage transitions
        if (batch.recipe) {
          const currentStage = batch.recipe.stages[batch.currentStage];
          if (currentStage) {
            const stageStartDate = new Date(batch.startDate);
            // Calculate days into current stage
            for (let i = 0; i < batch.currentStage; i++) {
              stageStartDate.setDate(stageStartDate.getDate() + batch.recipe.stages[i].duration);
            }
            const daysInStage = Math.floor((new Date() - stageStartDate) / (1000 * 60 * 60 * 24));
            
            // Alert 1 day before stage transition
            if (daysInStage === currentStage.duration - 1) {
              const existingAlert = await Alert.findOne({
                where: {
                  userId: batch.ownerId,
                  batchId: batch.batchNumber,
                  type: 'batch_milestone',
                  'metadata.milestone': 'stage_transition',
                  createdAt: {
                    [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                  }
                }
              });

              if (!existingAlert) {
                const alert = await this.generateStageTransitionAlert(batch, batch.currentStage + 1);
                if (alert) alerts.push(alert);
              }
            }
          }
        }
      }

      return alerts;
    } catch (error) {
      logger.error('Error checking batch milestones:', error);
      throw error;
    }
  }

  /**
   * Generate harvest reminder alert
   */
  async generateHarvestReminderAlert(batch) {
    try {
      const alert = await Alert.create({
        userId: batch.ownerId,
        type: 'harvest_reminder',
        severity: 'medium',
        title: 'Harvest Ready',
        message: `Batch ${batch.batchNumber} (${batch.cropName}) is ready for harvest!`,
        batchId: batch.batchNumber,
        zoneId: batch.zoneId,
        actionUrl: `/zones/${batch.zoneId}`,
        actionLabel: 'Record Harvest',
        metadata: {
          batchNumber: batch.batchNumber,
          cropName: batch.cropName,
          startDate: batch.startDate,
          expectedEndDate: batch.expectedEndDate
        }
      });

      logger.info(`Generated harvest reminder for batch ${batch.batchNumber}`);
      return alert;
    } catch (error) {
      logger.error('Error generating harvest reminder:', error);
      return null;
    }
  }

  /**
   * Generate stage transition alert
   */
  async generateStageTransitionAlert(batch, nextStage) {
    try {
      const stageName = batch.recipe?.stages[nextStage]?.name || `Stage ${nextStage + 1}`;
      
      const alert = await Alert.create({
        userId: batch.ownerId,
        type: 'batch_milestone',
        severity: 'low',
        title: 'Stage Transition Tomorrow',
        message: `Batch ${batch.batchNumber} will enter "${stageName}" tomorrow. Prepare any necessary changes.`,
        batchId: batch.batchNumber,
        zoneId: batch.zoneId,
        actionUrl: `/zones/${batch.zoneId}`,
        actionLabel: 'View Batch',
        metadata: {
          milestone: 'stage_transition',
          batchNumber: batch.batchNumber,
          nextStage,
          stageName
        }
      });

      logger.info(`Generated stage transition alert for batch ${batch.batchNumber}`);
      return alert;
    } catch (error) {
      logger.error('Error generating stage transition alert:', error);
      return null;
    }
  }

  /**
   * Format parameter name for display
   */
  formatParameterName(param) {
    const names = {
      temperature: 'Temperature',
      humidity: 'Humidity',
      co2: 'CO₂',
      light: 'Light',
      airflow: 'Airflow',
      soilMoisture: 'Soil Moisture'
    };
    return names[param] || param;
  }

  /**
   * Check for task reminders and overdue tasks
   */
  async checkTaskReminders() {
    try {
      const { Task } = require('../models');

      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      // Find tasks due within the next hour that need reminders
      const upcomingTasks = await Task.findAll({
        where: {
          status: { [Op.in]: ['pending', 'in_progress'] },
          dueDate: {
            [Op.between]: [now, oneHourFromNow]
          },
          reminderEnabled: true,
          reminderSent: false
        }
      });

      for (const task of upcomingTasks) {
        const reminderTime = new Date(task.dueDate);
        reminderTime.setMinutes(reminderTime.getMinutes() - task.reminderBefore);

        if (now >= reminderTime) {
          await this.createAlert({
            userId: task.assignedTo || task.ownerId,
            organizationId: task.organizationId,
            type: 'task',
            severity: task.priority === 'urgent' ? 'high' : 'medium',
            title: 'Task Reminder',
            message: `Task "${task.title}" is due ${this.formatDueTime(task.dueDate, task.dueTime)}`,
            zoneId: task.zoneId,
            batchId: task.batchId,
            actionUrl: `/tasks`,
            actionLabel: 'View Task',
            metadata: {
              taskId: task.id,
              category: task.category
            }
          });

          // Mark reminder as sent
          await task.update({ reminderSent: true });
          logger.info(`Sent reminder for task ${task.id}`);
        }
      }

      // Find overdue tasks
      const overdueTasks = await Task.findAll({
        where: {
          status: { [Op.in]: ['pending', 'in_progress'] },
          dueDate: { [Op.lt]: now }
        }
      });

      for (const task of overdueTasks) {
        // Update status to overdue
        if (task.status !== 'overdue') {
          await task.update({ status: 'overdue' });

          // Create alert
          await this.createAlert({
            userId: task.assignedTo || task.ownerId,
            organizationId: task.organizationId,
            type: 'warning',
            severity: 'high',
            title: 'Task Overdue',
            message: `Task "${task.title}" is now overdue`,
            zoneId: task.zoneId,
            batchId: task.batchId,
            actionUrl: `/tasks`,
            actionLabel: 'View Task',
            metadata: {
              taskId: task.id,
              category: task.category,
              dueDate: task.dueDate
            }
          });

          logger.info(`Marked task ${task.id} as overdue and created alert`);
        }
      }

      logger.info(`Checked task reminders: ${upcomingTasks.length} upcoming, ${overdueTasks.length} overdue`);
    } catch (error) {
      logger.error('Error checking task reminders:', error);
      throw error;
    }
  }

  /**
   * Format due time for display
   */
  formatDueTime(date, time) {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = '';
    if (d.toDateString() === today.toDateString()) {
      dateStr = 'today';
    } else if (d.toDateString() === tomorrow.toDateString()) {
      dateStr = 'tomorrow';
    } else {
      dateStr = `on ${d.toLocaleDateString()}`;
    }

    return time ? `${dateStr} at ${time}` : dateStr;
  }

  /**
   * Clean up old dismissed alerts
   */
  async cleanupOldAlerts(daysOld = 30) {
    try {
      const result = await Alert.destroy({
        where: {
          status: 'dismissed',
          dismissedAt: {
            [Op.lte]: new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000)
          }
        }
      });

      logger.info(`Cleaned up ${result} old alerts`);
      return result;
    } catch (error) {
      logger.error('Error cleaning up old alerts:', error);
      throw error;
    }
  }
}

module.exports = new AlertService();


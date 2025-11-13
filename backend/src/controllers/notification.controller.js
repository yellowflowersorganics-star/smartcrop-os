const alertService = require('../services/alert.service');
const twilioService = require('../services/twilio.service');
const schedulerService = require('../services/scheduler.service');
const { Employee, Task } = require('../models');
const logger = require('../utils/logger');

class NotificationController {
  constructor() {
    this.sendTestWhatsApp = this.sendTestWhatsApp.bind(this);
    this.sendTestSMS = this.sendTestSMS.bind(this);
    this.sendTaskNotification = this.sendTaskNotification.bind(this);
    this.triggerDailySummary = this.triggerDailySummary.bind(this);
    this.getNotificationStatus = this.getNotificationStatus.bind(this);
    this.triggerScheduledJob = this.triggerScheduledJob.bind(this);
  }

  /**
   * Send test WhatsApp message
   * @route POST /api/notifications/test/whatsapp
   */
  async sendTestWhatsApp(req, res) {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          success: false,
          message: 'Phone number (to) and message are required'
        });
      }

      const result = await twilioService.sendWhatsApp(to, message);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'WhatsApp message sent successfully',
          messageId: result.messageId
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send WhatsApp message',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error sending test WhatsApp:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  /**
   * Send test SMS message
   * @route POST /api/notifications/test/sms
   */
  async sendTestSMS(req, res) {
    try {
      const { to, message } = req.body;

      if (!to || !message) {
        return res.status(400).json({
          success: false,
          message: 'Phone number (to) and message are required'
        });
      }

      const result = await twilioService.sendSMS(to, message);

      if (result.success) {
        return res.status(200).json({
          success: true,
          message: 'SMS sent successfully',
          messageId: result.messageId
        });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to send SMS',
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error sending test SMS:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  /**
   * Send task notification to employee
   * @route POST /api/notifications/task/:taskId
   */
  async sendTaskNotification(req, res) {
    try {
      const { taskId } = req.params;

      const task = await Task.findByPk(taskId, {
        include: [
          {
            model: Employee,
            as: 'assignedEmployee'
          }
        ]
      });

      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }

      if (!task.assignedEmployee) {
        return res.status(400).json({
          success: false,
          message: 'Task is not assigned to an employee'
        });
      }

      const result = await alertService.sendTaskNotification(task, task.assignedEmployee);

      return res.status(200).json({
        success: true,
        message: 'Task notification sent',
        result
      });
    } catch (error) {
      logger.error('Error sending task notification:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  /**
   * Trigger daily summary manually (for testing or on-demand)
   * @route POST /api/notifications/daily-summary
   */
  async triggerDailySummary(req, res) {
    try {
      logger.info('📨 Manually triggering daily summary...');
      const results = await alertService.sendDailySummaries();

      return res.status(200).json({
        success: true,
        message: `Daily summaries sent to ${results.length} employees`,
        results
      });
    } catch (error) {
      logger.error('Error triggering daily summary:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  /**
   * Get notification system status
   * @route GET /api/notifications/status
   */
  async getNotificationStatus(req, res) {
    try {
      const twilioStatus = twilioService.getStatus();
      const schedulerStatus = schedulerService.getStatus();

      return res.status(200).json({
        success: true,
        twilio: twilioStatus,
        scheduler: schedulerStatus,
        features: {
          whatsapp: twilioStatus.whatsappConfigured,
          sms: twilioStatus.smsConfigured,
          email: false, // Not implemented yet
          push: false   // Not implemented yet
        }
      });
    } catch (error) {
      logger.error('Error getting notification status:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }

  /**
   * Manually trigger a scheduled job
   * @route POST /api/notifications/trigger/:jobName
   */
  async triggerScheduledJob(req, res) {
    try {
      const { jobName } = req.params;

      const validJobs = ['dailySummary', 'inventoryCheck', 'batchMilestones', 'taskReminders', 'cleanupAlerts'];
      
      if (!validJobs.includes(jobName)) {
        return res.status(400).json({
          success: false,
          message: `Invalid job name. Valid jobs: ${validJobs.join(', ')}`
        });
      }

      logger.info(`🔄 Manually triggering job: ${jobName}`);
      const result = await schedulerService.triggerJob(jobName);

      return res.status(200).json({
        success: true,
        message: `Job ${jobName} triggered successfully`,
        result
      });
    } catch (error) {
      logger.error('Error triggering scheduled job:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController();


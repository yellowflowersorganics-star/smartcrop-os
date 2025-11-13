const cron = require('node-cron');
const alertService = require('./alert.service');
const logger = require('../utils/logger');

class SchedulerService {
  constructor() {
    this.jobs = {};
  }

  /**
   * Initialize all scheduled tasks
   */
  init() {
    logger.info('🕐 Initializing scheduled tasks...');

    // Daily summary at 7:00 AM every day
    this.jobs.dailySummary = cron.schedule('0 7 * * *', async () => {
      logger.info('⏰ Running daily summary task...');
      try {
        const results = await alertService.sendDailySummaries();
        logger.info(`✅ Daily summaries sent to ${results.length} employees`);
      } catch (error) {
        logger.error('❌ Error sending daily summaries:', error);
      }
    }, {
      timezone: process.env.TIMEZONE || 'UTC'
    });

    // Check inventory levels every 6 hours
    this.jobs.inventoryCheck = cron.schedule('0 */6 * * *', async () => {
      logger.info('⏰ Running inventory check task...');
      try {
        const alerts = await alertService.checkInventoryLevels();
        logger.info(`✅ Generated ${alerts.length} inventory alerts`);
      } catch (error) {
        logger.error('❌ Error checking inventory levels:', error);
      }
    });

    // Check batch milestones every 12 hours
    this.jobs.batchMilestones = cron.schedule('0 */12 * * *', async () => {
      logger.info('⏰ Running batch milestones check...');
      try {
        const alerts = await alertService.checkBatchMilestones();
        logger.info(`✅ Generated ${alerts.length} batch milestone alerts`);
      } catch (error) {
        logger.error('❌ Error checking batch milestones:', error);
      }
    });

    // Check task reminders every 15 minutes
    this.jobs.taskReminders = cron.schedule('*/15 * * * *', async () => {
      logger.info('⏰ Checking task reminders...');
      try {
        await alertService.checkTaskReminders();
        logger.info('✅ Task reminders checked');
      } catch (error) {
        logger.error('❌ Error checking task reminders:', error);
      }
    });

    // Clean up old alerts every day at 3:00 AM
    this.jobs.cleanupAlerts = cron.schedule('0 3 * * *', async () => {
      logger.info('⏰ Running alert cleanup task...');
      try {
        const count = await alertService.cleanupOldAlerts(30);
        logger.info(`✅ Cleaned up ${count} old alerts`);
      } catch (error) {
        logger.error('❌ Error cleaning up old alerts:', error);
      }
    });

    logger.info('✅ Scheduled tasks initialized:');
    logger.info('  - Daily summary: 7:00 AM');
    logger.info('  - Inventory check: Every 6 hours');
    logger.info('  - Batch milestones: Every 12 hours');
    logger.info('  - Task reminders: Every 15 minutes');
    logger.info('  - Alert cleanup: 3:00 AM daily');
  }

  /**
   * Stop all scheduled tasks
   */
  stopAll() {
    logger.info('🛑 Stopping all scheduled tasks...');
    Object.keys(this.jobs).forEach(jobName => {
      if (this.jobs[jobName]) {
        this.jobs[jobName].stop();
        logger.info(`  - Stopped: ${jobName}`);
      }
    });
    logger.info('✅ All scheduled tasks stopped');
  }

  /**
   * Start all scheduled tasks
   */
  startAll() {
    logger.info('▶️  Starting all scheduled tasks...');
    Object.keys(this.jobs).forEach(jobName => {
      if (this.jobs[jobName]) {
        this.jobs[jobName].start();
        logger.info(`  - Started: ${jobName}`);
      }
    });
    logger.info('✅ All scheduled tasks started');
  }

  /**
   * Get status of all scheduled tasks
   */
  getStatus() {
    const status = {};
    Object.keys(this.jobs).forEach(jobName => {
      status[jobName] = {
        running: this.jobs[jobName] ? true : false
      };
    });
    return status;
  }

  /**
   * Manually trigger a specific job
   */
  async triggerJob(jobName) {
    logger.info(`🔄 Manually triggering job: ${jobName}`);
    
    switch (jobName) {
      case 'dailySummary':
        return await alertService.sendDailySummaries();
      
      case 'inventoryCheck':
        return await alertService.checkInventoryLevels();
      
      case 'batchMilestones':
        return await alertService.checkBatchMilestones();
      
      case 'taskReminders':
        return await alertService.checkTaskReminders();
      
      case 'cleanupAlerts':
        return await alertService.cleanupOldAlerts(30);
      
      default:
        throw new Error(`Unknown job: ${jobName}`);
    }
  }
}

// Export singleton instance
module.exports = new SchedulerService();


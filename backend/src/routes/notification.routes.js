const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

/**
 * @route   GET /api/notifications/status
 * @desc    Get notification system status (Twilio, Scheduler)
 * @access  Private
 */
router.get('/status', authenticate, notificationController.getNotificationStatus);

/**
 * @route   POST /api/notifications/test/whatsapp
 * @desc    Send test WhatsApp message
 * @access  Private
 */
router.post('/test/whatsapp', authenticate, notificationController.sendTestWhatsApp);

/**
 * @route   POST /api/notifications/test/sms
 * @desc    Send test SMS message
 * @access  Private
 */
router.post('/test/sms', authenticate, notificationController.sendTestSMS);

/**
 * @route   POST /api/notifications/task/:taskId
 * @desc    Send task notification to assigned employee
 * @access  Private
 */
router.post('/task/:taskId', authenticate, notificationController.sendTaskNotification);

/**
 * @route   POST /api/notifications/daily-summary
 * @desc    Manually trigger daily summary (for testing)
 * @access  Private
 */
router.post('/daily-summary', authenticate, notificationController.triggerDailySummary);

/**
 * @route   POST /api/notifications/trigger/:jobName
 * @desc    Manually trigger a scheduled job
 * @access  Private
 */
router.post('/trigger/:jobName', authenticate, notificationController.triggerScheduledJob);

module.exports = router;


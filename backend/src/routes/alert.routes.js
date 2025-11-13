/**
 * Alert & Notification Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const alertController = require('../controllers/alert.controller');
const notificationController = require('../controllers/notification.controller');

// Apply authentication to all routes
router.use(authenticate);

// Alert CRUD
router.get('/alerts', alertController.getAllAlerts);
router.get('/alerts/unread-count', alertController.getUnreadCount);
router.get('/alerts/:id', alertController.getAlertById);
router.post('/alerts', alertController.createAlert);
router.put('/alerts/:id', alertController.updateAlert);
router.delete('/alerts/:id', alertController.deleteAlert);

// Alert Actions
router.post('/alerts/:id/read', alertController.markAsRead);
router.post('/alerts/:id/unread', alertController.markAsUnread);
router.post('/alerts/:id/dismiss', alertController.dismiss);
router.post('/alerts/:id/acknowledge', alertController.acknowledge);
router.post('/alerts/read-all', alertController.markAllAsRead);
router.post('/alerts/dismiss-all', alertController.dismissAll);

// Notification Preferences
router.get('/preferences', alertController.getPreferences);
router.put('/preferences', alertController.updatePreferences);

// Notification Management (WhatsApp/SMS)
router.get('/system/status', notificationController.getNotificationStatus);
router.post('/send/whatsapp', notificationController.sendTestWhatsApp);
router.post('/send/sms', notificationController.sendTestSMS);
router.post('/send/task/:taskId', notificationController.sendTaskNotification);
router.post('/send/daily-summary', notificationController.triggerDailySummary);
router.post('/trigger/:jobName', notificationController.triggerScheduledJob);

module.exports = router;


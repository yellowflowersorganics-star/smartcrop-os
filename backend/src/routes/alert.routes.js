/**
 * Alert & Notification Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const alertController = require('../controllers/alert.controller');

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

module.exports = router;


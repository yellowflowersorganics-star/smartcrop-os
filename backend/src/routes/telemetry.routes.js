/**
 * SmartCrop OS - Telemetry Routes
 */

const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetry.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get telemetry data for a zone
router.get('/zone/:zoneId', telemetryController.getZoneTelemetry);

// Get telemetry data for a device
router.get('/device/:deviceId', telemetryController.getDeviceTelemetry);

// Get latest readings for a zone
router.get('/zone/:zoneId/latest', telemetryController.getLatestReadings);

// Get historical data with aggregation
router.get('/zone/:zoneId/history', telemetryController.getHistoricalData);

// Export telemetry data
router.get('/zone/:zoneId/export', telemetryController.exportData);

module.exports = router;


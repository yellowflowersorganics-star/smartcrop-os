/**
 * SmartCrop - Telemetry Routes
 */

const express = require('express');
const router = express.Router();
const telemetryController = require('../controllers/telemetry.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Record a new reading
router.post('/readings', telemetryController.recordReading);

// Get telemetry data for a zone
router.get('/zone/:zoneId', telemetryController.getZoneTelemetry);

// Get latest readings for a zone
router.get('/zone/:zoneId/latest', telemetryController.getLatestReadings);

// Get historical data with aggregation
router.get('/zone/:zoneId/history', telemetryController.getHistoricalData);

// Get averages for a time period
router.get('/zone/:zoneId/averages', telemetryController.getAverages);

// Generate simulated data for testing (development only)
router.post('/zone/:zoneId/simulate', telemetryController.generateSimulatedData);

module.exports = router;


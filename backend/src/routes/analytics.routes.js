/**
 * SmartCrop OS - Analytics Routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get farm analytics dashboard
router.get('/dashboard/:farmId', analyticsController.getFarmDashboard);

// Get zone performance metrics
router.get('/zone/:zoneId/performance', analyticsController.getZonePerformance);

// Get crop yield predictions
router.get('/zone/:zoneId/predictions', analyticsController.getYieldPredictions);

// Get energy consumption
router.get('/farm/:farmId/energy', analyticsController.getEnergyAnalytics);

// Get environmental compliance report
router.get('/zone/:zoneId/compliance', analyticsController.getComplianceReport);

// Compare different crop batches
router.get('/compare', analyticsController.compareBatches);

module.exports = router;


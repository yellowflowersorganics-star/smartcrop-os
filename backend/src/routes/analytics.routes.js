/**
 * SmartCrop - Analytics Routes
 */

const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');

// Apply authentication to all routes
router.use(authenticate);

// Overview statistics
router.get('/overview', analyticsController.getOverview);

// Yield trends over time
router.get('/yield-trends', analyticsController.getYieldTrends);

// Batch performance comparison
router.get('/batch-performance', analyticsController.getBatchPerformance);

// Recipe performance comparison
router.get('/recipe-performance', analyticsController.getRecipePerformance);

// Quality distribution
router.get('/quality-distribution', analyticsController.getQualityDistribution);

// Recent activity
router.get('/recent-activity', analyticsController.getRecentActivity);

module.exports = router;

/**
 * Profitability Analytics Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const profitabilityController = require('../controllers/profitability.controller');

// Apply authentication to all routes
router.use(authenticate);

// Profitability analytics
router.get('/overall', profitabilityController.getOverallProfitability);
router.get('/trends', profitabilityController.getProfitabilityTrends);
router.get('/cost-breakdown', profitabilityController.getCostBreakdown);
router.get('/revenue-breakdown', profitabilityController.getRevenueBreakdown);
router.get('/batch/:batchId', profitabilityController.getBatchProfitability);
router.get('/compare', profitabilityController.compareBatches);

module.exports = router;


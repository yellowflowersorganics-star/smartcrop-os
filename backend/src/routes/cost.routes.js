/**
 * Cost Tracking Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const costController = require('../controllers/cost.controller');

// Apply authentication to all routes
router.use(authenticate);

// Cost entries
router.get('/costs', costController.getAllCosts);
router.get('/costs/stats', costController.getCostStats);
router.get('/costs/breakdown', costController.getCostBreakdown);
router.get('/costs/trends', costController.getCostTrends);
router.get('/costs/:id', costController.getCostById);
router.post('/costs', costController.createCost);
router.put('/costs/:id', costController.updateCost);
router.delete('/costs/:id', costController.deleteCost);

// Batch and zone costs
router.get('/costs/batch/:batchId', costController.getBatchCosts);
router.get('/costs/zone/:zoneId', costController.getZoneCosts);

module.exports = router;


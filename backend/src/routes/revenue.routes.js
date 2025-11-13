/**
 * Revenue Tracking Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const revenueController = require('../controllers/revenue.controller');

// Apply authentication to all routes
router.use(authenticate);

// Revenue records
router.get('/revenue', revenueController.getAllRevenue);
router.get('/revenue/stats', revenueController.getRevenueStats);
router.get('/revenue/trends', revenueController.getRevenueTrends);
router.get('/revenue/pending-payments', revenueController.getPendingPayments);
router.get('/revenue/customers', revenueController.getCustomerRevenue);
router.get('/revenue/:id', revenueController.getRevenueById);
router.post('/revenue', revenueController.createRevenue);
router.put('/revenue/:id', revenueController.updateRevenue);
router.delete('/revenue/:id', revenueController.deleteRevenue);

// Batch revenue
router.get('/revenue/batch/:batchId', revenueController.getBatchRevenue);

module.exports = router;


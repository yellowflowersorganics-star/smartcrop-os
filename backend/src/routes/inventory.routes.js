/**
 * Inventory Management Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const inventoryController = require('../controllers/inventory.controller');

// Apply authentication to all routes
router.use(authenticate);

// Inventory Items
router.get('/items', inventoryController.getAllItems);
router.get('/items/low-stock', inventoryController.getLowStockItems);
router.get('/items/:id', inventoryController.getItemById);
router.post('/items', inventoryController.createItem);
router.put('/items/:id', inventoryController.updateItem);
router.delete('/items/:id', inventoryController.deleteItem);

// Stock Adjustments
router.post('/items/:id/adjust', inventoryController.adjustStock);

// Transactions
router.get('/transactions', inventoryController.getTransactions);

// Usage Tracking
router.post('/usage', inventoryController.recordUsage);

// Statistics
router.get('/stats', inventoryController.getInventoryStats);

module.exports = router;


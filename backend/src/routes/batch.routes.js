/**
 * SmartCrop OS - Batch Routes
 * Routes for managing growth cycle batches
 */

const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batch.controller');
const { authenticate } = require('../middleware/auth');

// All batch routes require authentication
router.use(authenticate);

// Batch management
router.post('/start', batchController.startBatch);
router.post('/:id/complete', batchController.completeBatch);
router.get('/', batchController.getAllBatches);
router.get('/:id', batchController.getBatchById);
router.put('/:id', batchController.updateBatch);

// Zone-specific batch routes
router.get('/zone/:zoneId/history', batchController.getZoneBatchHistory);
router.get('/zone/:zoneId/active', batchController.getActiveBatch);

module.exports = router;


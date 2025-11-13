/**
 * SmartCrop OS - Harvest Routes
 * Routes for harvest recording and tracking
 */

const express = require('express');
const router = express.Router();
const harvestController = require('../controllers/harvest.controller');
const { authenticate } = require('../middleware/auth');

// All harvest routes require authentication
router.use(authenticate);

// Harvest recording and management
router.post('/', harvestController.recordHarvest);
router.get('/', harvestController.getAllHarvests);
router.get('/stats', harvestController.getHarvestStats);
router.get('/:id', harvestController.getHarvestById);
router.put('/:id', harvestController.updateHarvest);
router.delete('/:id', harvestController.deleteHarvest);

// Batch-specific harvests
router.get('/batch/:batchId', harvestController.getBatchHarvests);

module.exports = router;

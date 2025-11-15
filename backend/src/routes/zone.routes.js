/**
 * CropWise - Zone Management Routes
 */

const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get all zones
router.get('/', zoneController.getAllZones);

// Get specific zone
router.get('/:id', zoneController.getZoneById);

// Create new zone
router.post('/', zoneController.createZone);

// Update zone
router.put('/:id', zoneController.updateZone);

// Delete zone
router.delete('/:id', zoneController.deleteZone);

// Assign crop recipe to zone
router.post('/:id/assign-recipe', zoneController.assignRecipe);

// Start/Stop crop batch in zone
router.post('/:id/start-batch', zoneController.startBatch);
router.post('/:id/stop-batch', zoneController.stopBatch);

// Get current zone status
router.get('/:id/status', zoneController.getZoneStatus);

// Get zone environmental data
router.get('/:id/environment', zoneController.getEnvironmentData);

module.exports = router;


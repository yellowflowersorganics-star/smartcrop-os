/**
 * SmartCrop OS - Farm Management Routes
 */

const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farm.controller');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Get all farms for user
router.get('/', farmController.getAllFarms);

// Get specific farm
router.get('/:id', farmController.getFarmById);

// Create new farm
router.post('/', farmController.createFarm);

// Update farm
router.put('/:id', farmController.updateFarm);

// Delete farm
router.delete('/:id', farmController.deleteFarm);

// Get farm statistics
router.get('/:id/stats', farmController.getFarmStats);

// Get farm zones
router.get('/:id/zones', farmController.getFarmZones);

module.exports = router;


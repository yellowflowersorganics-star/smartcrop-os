/**
 * SmartCrop OS - Device Management Routes
 */

const express = require('express');
const router = express.Router();
const deviceController = require('../controllers/device.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Get all devices
router.get('/', deviceController.getAllDevices);

// Get specific device
router.get('/:id', deviceController.getDeviceById);

// Register new device
router.post('/register', deviceController.registerDevice);

// Update device configuration
router.put('/:id', deviceController.updateDevice);

// Delete device
router.delete('/:id', deviceController.deleteDevice);

// Get device status
router.get('/:id/status', deviceController.getDeviceStatus);

// Provision device credentials
router.post('/:id/provision', deviceController.provisionDevice);

module.exports = router;


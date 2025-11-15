/**
 * CropWise - Control Routes
 * Manual control and override commands
 */

const express = require('express');
const router = express.Router();
const controlController = require('../controllers/control.controller');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

// Send control command to device
router.post('/command', controlController.sendCommand);

// Override automatic control
router.post('/override', controlController.overrideControl);

// Clear override
router.post('/override/clear', controlController.clearOverride);

// Get control history
router.get('/history/:zoneId', controlController.getControlHistory);

// Emergency stop
router.post('/emergency-stop', controlController.emergencyStop);

module.exports = router;


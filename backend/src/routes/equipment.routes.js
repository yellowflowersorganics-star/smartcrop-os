const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const equipmentController = require('../controllers/equipment.controller');

// Apply authentication to all routes
router.use(authenticate);

/**
 * Equipment CRUD
 */
router.get('/', equipmentController.getAllEquipment);
router.get('/status/all', equipmentController.getEquipmentStatus);
router.get('/zone/:zoneId', equipmentController.getZoneEquipment);
router.get('/:id', equipmentController.getEquipmentById);
router.post('/', equipmentController.createEquipment);
router.put('/:id', equipmentController.updateEquipment);
router.delete('/:id', equipmentController.deleteEquipment);

/**
 * Equipment Control
 */
router.post('/:id/command', equipmentController.sendControlCommand);
router.post('/:id/on', equipmentController.turnOn);
router.post('/:id/off', equipmentController.turnOff);
router.post('/:id/value', equipmentController.setValue);
router.post('/:id/mode', equipmentController.setMode);

/**
 * Command History
 */
router.get('/:id/commands', equipmentController.getCommandHistory);

module.exports = router;


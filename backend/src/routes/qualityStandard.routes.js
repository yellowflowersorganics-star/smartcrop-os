const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const qualityStandardController = require('../controllers/qualityStandard.controller');

// Quality Standard routes
router.get('/standards', authenticate, qualityStandardController.getAllStandards);
router.get('/standards/active', authenticate, qualityStandardController.getActiveStandards);
router.get('/standards/:id', authenticate, qualityStandardController.getStandardById);
router.post('/standards', authenticate, qualityStandardController.createStandard);
router.put('/standards/:id', authenticate, qualityStandardController.updateStandard);
router.delete('/standards/:id', authenticate, qualityStandardController.deleteStandard);
router.post('/standards/:id/approve', authenticate, qualityStandardController.approveStandard);
router.post('/standards/:id/duplicate', authenticate, qualityStandardController.duplicateStandard);

module.exports = router;


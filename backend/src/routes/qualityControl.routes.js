const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const qualityControlController = require('../controllers/qualityControl.controller');

// Quality Check routes
router.get('/checks', authenticate, qualityControlController.getAllQualityChecks);
router.get('/checks/:id', authenticate, qualityControlController.getQualityCheckById);
router.post('/checks', authenticate, qualityControlController.createQualityCheck);
router.put('/checks/:id', authenticate, qualityControlController.updateQualityCheck);
router.delete('/checks/:id', authenticate, qualityControlController.deleteQualityCheck);
router.post('/checks/:id/review', authenticate, qualityControlController.reviewQualityCheck);

// Defect routes
router.get('/defects', authenticate, qualityControlController.getDefects);
router.post('/checks/:qualityCheckId/defects', authenticate, qualityControlController.addDefect);
router.put('/defects/:id', authenticate, qualityControlController.updateDefect);
router.delete('/defects/:id', authenticate, qualityControlController.deleteDefect);

// Statistics and analytics
router.get('/stats', authenticate, qualityControlController.getQualityStats);
router.get('/defects/analysis', authenticate, qualityControlController.getDefectAnalysis);
router.get('/compliance', authenticate, qualityControlController.getComplianceReport);

module.exports = router;


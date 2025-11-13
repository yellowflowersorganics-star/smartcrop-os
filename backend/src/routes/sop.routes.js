const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const sopController = require('../controllers/sop.controller');
const sopExecutionController = require('../controllers/sopExecution.controller');

// SOP Management routes
router.get('/sops', authenticate, sopController.getAllSOPs);
router.get('/sops/stats', authenticate, sopController.getSOPStats);
router.get('/sops/:id', authenticate, sopController.getSOPById);
router.post('/sops', authenticate, sopController.createSOP);
router.put('/sops/:id', authenticate, sopController.updateSOP);
router.delete('/sops/:id', authenticate, sopController.deleteSOP);
router.post('/sops/:id/approve', authenticate, sopController.approveSOP);
router.post('/sops/:id/duplicate', authenticate, sopController.duplicateSOP);

// SOP Execution routes
router.post('/executions', authenticate, sopExecutionController.startExecution);
router.get('/executions', authenticate, sopExecutionController.getAllExecutions);
router.get('/executions/my', authenticate, sopExecutionController.getMyExecutions);
router.get('/executions/:id', authenticate, sopExecutionController.getExecutionById);
router.put('/executions/:id', authenticate, sopExecutionController.updateExecution);
router.post('/executions/:id/step', authenticate, sopExecutionController.completeStep);
router.post('/executions/:id/complete', authenticate, sopExecutionController.completeExecution);

module.exports = router;


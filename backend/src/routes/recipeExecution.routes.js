const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const recipeExecutionController = require('../controllers/recipeExecution.controller');

// Apply authentication to all routes
router.use(authenticate);

/**
 * Recipe Execution Management
 */
router.post('/start', recipeExecutionController.startExecution);
router.get('/', recipeExecutionController.getAllExecutions);
router.get('/zone/:zoneId', recipeExecutionController.getZoneExecution);
router.get('/:id', recipeExecutionController.getExecutionById);
router.get('/:id/progress', recipeExecutionController.getExecutionProgress);

/**
 * Stage Approval (THE KEY FEATURE!)
 */
router.post('/:id/approve', recipeExecutionController.approveStageTransition);
router.post('/:id/decline', recipeExecutionController.declineStageTransition);

/**
 * Execution Control
 */
router.post('/:id/pause', recipeExecutionController.pauseExecution);
router.post('/:id/resume', recipeExecutionController.resumeExecution);
router.post('/:id/abort', recipeExecutionController.abortExecution);

module.exports = router;


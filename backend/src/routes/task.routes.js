/**
 * Task Management Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const taskController = require('../controllers/task.controller');

// Apply authentication to all routes
router.use(authenticate);

// Task CRUD
router.get('/tasks', taskController.getAllTasks);
router.get('/tasks/upcoming', taskController.getUpcomingTasks);
router.get('/tasks/overdue', taskController.getOverdueTasks);
router.get('/tasks/stats', taskController.getTaskStats);
router.get('/tasks/:id', taskController.getTaskById);
router.post('/tasks', taskController.createTask);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);

// Task Actions
router.post('/tasks/:id/complete', taskController.completeTask);
router.post('/tasks/:id/status', taskController.updateTaskStatus);
router.put('/tasks/:id/checklist', taskController.updateChecklist);

// Templates
router.get('/templates', taskController.getAllTemplates);
router.get('/templates/:id', taskController.getTemplateById);
router.post('/templates', taskController.createTemplate);
router.put('/templates/:id', taskController.updateTemplate);
router.delete('/templates/:id', taskController.deleteTemplate);
router.post('/templates/:id/create-task', taskController.createTaskFromTemplate);

module.exports = router;


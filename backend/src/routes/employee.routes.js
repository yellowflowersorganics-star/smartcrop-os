const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const employeeController = require('../controllers/employee.controller');

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/employees', employeeController.createEmployee);
router.get('/employees', employeeController.getAllEmployees);
router.get('/employees/generate-id', employeeController.generateEmployeeId);
router.get('/employees/:id', employeeController.getEmployeeById);
router.put('/employees/:id', employeeController.updateEmployee);
router.delete('/employees/:id', employeeController.deleteEmployee);

// Employee status
router.patch('/employees/:id/status', employeeController.updateStatus);

// Link user account
router.post('/employees/:id/link-user', employeeController.linkUserAccount);

// Employee statistics
router.get('/employees/:id/stats', employeeController.getEmployeeStats);
router.get('/employees/:id/tasks', employeeController.getEmployeeTasks);
router.get('/employees/:id/work-logs', employeeController.getEmployeeWorkLogs);

module.exports = router;


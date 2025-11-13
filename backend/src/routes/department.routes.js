const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const departmentController = require('../controllers/department.controller');

// All routes require authentication
router.use(authenticate);

// Department routes
router.post('/departments', departmentController.createDepartment);
router.get('/departments', departmentController.getAllDepartments);
router.get('/departments/:id', departmentController.getDepartmentById);
router.put('/departments/:id', departmentController.updateDepartment);
router.delete('/departments/:id', departmentController.deleteDepartment);

// Department employees
router.get('/departments/:id/employees', departmentController.getDepartmentEmployees);

module.exports = router;


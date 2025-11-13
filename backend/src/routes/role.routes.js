const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const roleController = require('../controllers/role.controller');

// All routes require authentication
router.use(authenticate);

// System roles
router.post('/roles/seed-system', roleController.seedSystemRoles);
router.get('/roles/system', roleController.getSystemRoles);

// Role routes
router.post('/roles', roleController.createRole);
router.get('/roles', roleController.getAllRoles);
router.get('/roles/:id', roleController.getRoleById);
router.put('/roles/:id', roleController.updateRole);
router.delete('/roles/:id', roleController.deleteRole);

module.exports = router;


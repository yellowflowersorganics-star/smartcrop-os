/**
 * Labor Tracking Routes
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const laborController = require('../controllers/labor.controller');

// Apply authentication to all routes
router.use(authenticate);

// Clock in/out
router.post('/clock-in', laborController.clockIn);
router.post('/clock-out', laborController.clockOut);
router.get('/current-shift', laborController.getCurrentShift);

// Work logs
router.get('/work-logs', laborController.getAllWorkLogs);
router.get('/my-work-logs', laborController.getMyWorkLogs);
router.get('/work-logs/stats', laborController.getLaborStats);
router.get('/work-logs/costs', laborController.getLaborCosts);
router.get('/work-logs/:id', laborController.getWorkLogById);
router.post('/work-logs', laborController.createWorkLog);
router.put('/work-logs/:id', laborController.updateWorkLog);
router.delete('/work-logs/:id', laborController.deleteWorkLog);
router.post('/work-logs/:id/approve', laborController.approveWorkLog);

module.exports = router;


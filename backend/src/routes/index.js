/**
 * SmartCrop OS - Main Router
 * Aggregates all API routes
 */

const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./auth.routes');
const cropRecipeRoutes = require('./cropRecipe.routes');
const farmRoutes = require('./farm.routes');
const unitRoutes = require('./unit.routes');
const zoneRoutes = require('./zone.routes');
const batchRoutes = require('./batch.routes');
const harvestRoutes = require('./harvest.routes');
const deviceRoutes = require('./device.routes');
const telemetryRoutes = require('./telemetry.routes');
const controlRoutes = require('./control.routes');
const analyticsRoutes = require('./analytics.routes');
const subscriptionRoutes = require('./subscription.routes');
const inventoryRoutes = require('./inventory.routes');
const alertRoutes = require('./alert.routes');
const taskRoutes = require('./task.routes');

// API version info
router.get('/', (req, res) => {
  res.json({
    name: 'SmartCrop OS API',
    version: '1.0.0',
    status: 'operational',
    documentation: '/api/docs'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/crop-recipes', cropRecipeRoutes);
router.use('/farms', farmRoutes);
router.use('/units', unitRoutes);
router.use('/zones', zoneRoutes);
router.use('/batches', batchRoutes);
router.use('/devices', deviceRoutes);
router.use('/harvests', harvestRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/control', controlRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/notifications', alertRoutes);
router.use('/tasks', taskRoutes);

module.exports = router;


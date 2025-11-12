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
const zoneRoutes = require('./zone.routes');
const deviceRoutes = require('./device.routes');
const telemetryRoutes = require('./telemetry.routes');
const controlRoutes = require('./control.routes');
const analyticsRoutes = require('./analytics.routes');
const subscriptionRoutes = require('./subscription.routes');

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
router.use('/zones', zoneRoutes);
router.use('/devices', deviceRoutes);
router.use('/telemetry', telemetryRoutes);
router.use('/control', controlRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/subscriptions', subscriptionRoutes);

module.exports = router;


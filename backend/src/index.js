/**
 * SmartCrop - Backend Entry Point
 * Main server initialization and configuration
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const logger = require('./utils/logger');
const routes = require('./routes');
const { connectDatabase } = require('./config/database');
const { connectMQTT } = require('./services/mqtt');
const { connectRedis } = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');
const schedulerService = require('./services/scheduler.service');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// Middleware
// ============================================
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: logger.stream }));

// ============================================
// Health Check
// ============================================
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API Routes
// ============================================
app.use('/api', routes);

// ============================================
// Error Handling
// ============================================
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ============================================
// Server Initialization
// ============================================
const startServer = async () => {
  try {
    // Connect to database (required)
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Connect to Redis (optional for development)
    try {
      await connectRedis();
      logger.info('✅ Redis connected successfully');
    } catch (error) {
      logger.warn('⚠️  Redis not available (optional for development)');
    }

    // Connect to MQTT broker (optional for development)
    try {
      await connectMQTT();
      logger.info('✅ MQTT broker connected successfully');
    } catch (error) {
      logger.warn('⚠️  MQTT broker not available (optional for development)');
    }

    // Initialize scheduled tasks
    try {
      schedulerService.init();
      logger.info('✅ Scheduled tasks initialized successfully');
    } catch (error) {
      logger.warn('⚠️  Scheduler initialization failed (notifications may not work)', error);
    }

    // Start Express server
    app.listen(PORT, () => {
      logger.info(`\n🌱 SmartCrop Backend running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API: http://localhost:${PORT}/api`);
      logger.info(`📖 Health: http://localhost:${PORT}/health\n`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  schedulerService.stopAll();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  schedulerService.stopAll();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;


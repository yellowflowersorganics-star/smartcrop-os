/**
 * SmartCrop OS - Database Configuration
 */

require('dotenv').config();

module.exports = {
  // Use SQLite for development (no PostgreSQL setup needed!)
  dialect: process.env.DB_DIALECT || 'sqlite',
  storage: process.env.DB_STORAGE || './smartcrop.db',
  
  // PostgreSQL config (for production)
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'smartcrop_db',
  username: process.env.DB_USER || 'smartcrop_user',
  password: process.env.DB_PASSWORD || 'password',
  
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    underscored: true,
    timestamps: true
  }
};

/**
 * Connect to database
 */
const connectDatabase = async () => {
  const { sequelize } = require('../models');
  
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');
    
    // Auto-sync models in development (creates tables automatically)
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized');
    }
    
    return sequelize;
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

module.exports.connectDatabase = connectDatabase;


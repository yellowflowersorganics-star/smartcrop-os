/**
 * SmartCrop OS - Models Index
 * Initializes all database models and associations
 */

const { Sequelize } = require('sequelize');
const config = require('../config/database');

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool
  }
);

// Import models
const User = require('./User')(sequelize);
const Organization = require('./Organization')(sequelize);
const Farm = require('./Farm')(sequelize);
const Unit = require('./Unit')(sequelize);
const Zone = require('./Zone')(sequelize);
const Device = require('./Device')(sequelize);
const CropRecipe = require('./CropRecipe')(sequelize);
const Subscription = require('./Subscription')(sequelize);
const Invoice = require('./Invoice')(sequelize);

// Store models in db object
const db = {
  sequelize,
  Sequelize,
  User,
  Organization,
  Farm,
  Unit,
  Zone,
  Device,
  CropRecipe,
  Subscription,
  Invoice
};

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;


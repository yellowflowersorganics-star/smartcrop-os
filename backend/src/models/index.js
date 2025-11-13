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
const Batch = require('./Batch')(sequelize);
const Harvest = require('./Harvest')(sequelize);
const Telemetry = require('./Telemetry')(sequelize);
const Subscription = require('./Subscription')(sequelize);
const Invoice = require('./Invoice')(sequelize);
const InventoryItem = require('./InventoryItem')(sequelize);
const InventoryTransaction = require('./InventoryTransaction')(sequelize);
const Alert = require('./Alert')(sequelize);
const NotificationPreference = require('./NotificationPreference')(sequelize);
const Task = require('./Task')(sequelize);
const TaskTemplate = require('./TaskTemplate')(sequelize);
const WorkLog = require('./WorkLog')(sequelize);
const CostEntry = require('./CostEntry')(sequelize);
const Revenue = require('./Revenue')(sequelize);
const QualityCheck = require('./QualityCheck')(sequelize);
const Defect = require('./Defect')(sequelize);
const QualityStandard = require('./QualityStandard')(sequelize);

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
  Batch,
  Harvest,
  Telemetry,
  Subscription,
  Invoice,
  InventoryItem,
  InventoryTransaction,
  Alert,
  NotificationPreference,
  Task,
  TaskTemplate,
  WorkLog,
  CostEntry,
  Revenue,
  QualityCheck,
  Defect,
  QualityStandard
};

// Setup associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;


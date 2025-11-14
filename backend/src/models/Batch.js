/**
 * SmartCrop - Batch Model
 * Tracks individual growing cycles in zones
 * Each batch represents one complete growth cycle from start to harvest
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Batch = sequelize.define('Batch', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Human-readable batch identifier (e.g., ZONE-A1-2024-001)'
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'User who owns this batch'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Organization for multi-tenant isolation (optional for single-tenant)'
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Zone where this batch is growing'
    },
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Crop recipe being used'
    },
    cropName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Name of crop (denormalized for quick access)'
    },
    cropType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Type of crop (mushroom, vegetable, etc.)'
    },
    status: {
      type: DataTypes.ENUM('planned', 'active', 'completed', 'failed', 'cancelled'),
      defaultValue: 'planned',
      comment: 'Current status of the batch'
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'When the batch started growing'
    },
    expectedEndDate: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Expected harvest date based on recipe duration'
    },
    actualEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Actual harvest/completion date'
    },
    cycleDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Expected cycle duration in days (from recipe)'
    },
    plantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of plants/bags in this batch'
    },
    currentStage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Current growth stage index'
    },
    totalYieldKg: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Total yield harvested in kg'
    },
    harvestCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of harvest flushes'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Batch notes and observations'
    },
    failureReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Reason if batch failed'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional batch metadata'
    }
  }, {
    tableName: 'batches',
    timestamps: true,
    indexes: [
      { fields: ['zoneId'] },
      { fields: ['recipeId'] },
      { fields: ['status'] },
      { fields: ['organizationId'] },
      { fields: ['batchNumber'] }
    ]
  });

  Batch.associate = (models) => {
    Batch.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });
    Batch.belongsTo(models.CropRecipe, {
      foreignKey: 'recipeId',
      as: 'recipe'
    });
    Batch.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
    Batch.hasMany(models.Harvest, {
      foreignKey: 'batchId',
      as: 'harvests',
      sourceKey: 'batchNumber'
    });
  };

  return Batch;
};


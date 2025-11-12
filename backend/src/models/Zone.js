/**
 * SmartCrop OS - Zone Model
 * Represents a controlled environment zone within a farm
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Zone = sequelize.define('Zone', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    farmId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Physical zone identifier'
    },
    area: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Zone area in square meters'
    },
    activeRecipeId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Currently active crop recipe'
    },
    currentStage: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Current growth stage index'
    },
    batchStartDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the current crop batch started'
    },
    batchEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expected harvest date'
    },
    status: {
      type: DataTypes.ENUM('idle', 'running', 'paused', 'completed', 'error'),
      defaultValue: 'idle'
    },
    plantCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    currentSetpoints: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Current environmental setpoints'
    },
    lastEnvironmentData: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Latest sensor readings'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'zones',
    timestamps: true,
    indexes: [
      { fields: ['farmId'] },
      { fields: ['activeRecipeId'] },
      { fields: ['status'] }
    ]
  });

  Zone.associate = (models) => {
    Zone.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });
    Zone.belongsTo(models.CropRecipe, {
      foreignKey: 'activeRecipeId',
      as: 'activeRecipe'
    });
    Zone.hasMany(models.Device, {
      foreignKey: 'zoneId',
      as: 'devices'
    });
  };

  return Zone;
};


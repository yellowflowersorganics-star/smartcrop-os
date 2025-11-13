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
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Organization for multi-tenant isolation'
    },
    unitId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Unit/building this zone belongs to'
    },
    farmId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Optional farm grouping (for backwards compatibility)'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    zoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Physical zone identifier (e.g., "Room-A1")'
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
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Current environmental setpoints'
    },
    lastEnvironmentData: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Latest sensor readings'
    },
    metadata: {
      type: DataTypes.JSON,
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
    Zone.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
    Zone.belongsTo(models.Unit, {
      foreignKey: 'unitId',
      as: 'unit'
    });
    Zone.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });
    Zone.belongsTo(models.CropRecipe, {
      foreignKey: 'activeRecipeId',
      as: 'activeRecipe'
    });
    Zone.hasOne(models.Device, {
      foreignKey: 'zoneId',
      as: 'controller',
      scope: { deviceType: 'controller' }
    });
    Zone.hasMany(models.Device, {
      foreignKey: 'zoneId',
      as: 'devices'
    });
  };

  return Zone;
};


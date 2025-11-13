/**
 * SmartCrop OS - Crop Recipe Model
 * Defines environmental parameters for each crop growth stage
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CropRecipe = sequelize.define('CropRecipe', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    cropId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique identifier for the crop (e.g., cherry-tomato-v1)'
    },
    cropName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Display name of the crop'
    },
    cropType: {
      type: DataTypes.ENUM('mushroom', 'vegetable', 'leafy-green', 'berry', 'herb'),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    version: {
      type: DataTypes.STRING,
      defaultValue: '1.0.0'
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this recipe is publicly available'
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'User who created this recipe'
    },
    stages: {
      type: DataTypes.JSON,
      allowNull: false,
      comment: 'Array of growth stages with environmental parameters',
      validate: {
        isValidStages(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error('Stages must be a non-empty array');
          }
        }
      }
    },
    totalDuration: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Total duration in days (calculated from stages)'
    },
    requiredSensors: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'List of required sensor types (JSON array for SQLite compatibility)'
    },
    requiredActuators: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'List of required actuator types (JSON array for SQLite compatibility)'
    },
    estimatedYield: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Expected yield metrics'
    },
    difficulty: {
      type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
      defaultValue: 'intermediate'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Tags for categorization (JSON array for SQLite compatibility)'
    },
    marketplace: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Marketplace listing information (price, rating, etc.)'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'crop_recipes',
    timestamps: true,
    indexes: [
      { fields: ['cropType'] },
      { fields: ['cropId'] },
      { fields: ['authorId'] },
      { fields: ['isPublic'] }
    ]
  });

  CropRecipe.associate = (models) => {
    CropRecipe.belongsTo(models.User, {
      foreignKey: 'authorId',
      as: 'author'
    });
    CropRecipe.hasMany(models.Zone, {
      foreignKey: 'activeRecipeId',
      as: 'activeZones'
    });
  };

  return CropRecipe;
};


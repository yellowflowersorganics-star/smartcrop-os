/**
 * SmartCrop OS - Farm Model
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Farm = sequelize.define('Farm', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    location: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Geographic location and address'
    },
    farmType: {
      type: DataTypes.ENUM('indoor', 'greenhouse', 'outdoor', 'vertical'),
      defaultValue: 'indoor'
    },
    totalArea: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Total farm area'
    },
    units: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'sqm',
      comment: 'Area measurement units (sqft, sqm, acre, hectare)'
    },
    timezone: {
      type: DataTypes.STRING,
      defaultValue: 'Asia/Kolkata'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance'),
      defaultValue: 'active'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'farms',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['status'] }
    ]
  });

  Farm.associate = (models) => {
    Farm.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
    Farm.hasMany(models.Zone, {
      foreignKey: 'farmId',
      as: 'zones'
    });
  };

  return Farm;
};


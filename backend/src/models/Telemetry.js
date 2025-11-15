/**
 * CropWise - Telemetry Model
 * Stores environmental sensor data readings
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Telemetry = sequelize.define('Telemetry', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Zone where reading was taken'
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Device that captured the reading'
    },
    // Environmental parameters
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Temperature in Celsius'
    },
    humidity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Relative humidity percentage'
    },
    co2: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'CO2 level in PPM'
    },
    light: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Light intensity in lux'
    },
    airflow: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Air flow rate'
    },
    soilMoisture: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Soil moisture percentage'
    },
    // Metadata
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When the reading was taken'
    },
    source: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'sensor',
      comment: 'Data source: sensor, manual, simulated'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'telemetry',
    timestamps: true,
    indexes: [
      { fields: ['zoneId'] },
      { fields: ['timestamp'] },
      { fields: ['deviceId'] },
      { fields: ['zoneId', 'timestamp'] }
    ]
  });

  Telemetry.associate = (models) => {
    Telemetry.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });
  };

  return Telemetry;
};


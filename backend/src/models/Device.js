/**
 * SmartCrop OS - Device Model
 * Edge IoT devices (ESP32, sensors, actuators)
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Device = sequelize.define('Device', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Physical device identifier (MAC address, serial, etc.)'
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    deviceType: {
      type: DataTypes.ENUM('controller', 'sensor', 'actuator', 'gateway'),
      allowNull: false
    },
    deviceModel: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'e.g., ESP32, SHT31, MH-Z19C'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('online', 'offline', 'error', 'maintenance'),
      defaultValue: 'offline'
    },
    firmwareVersion: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastSeen: {
      type: DataTypes.DATE,
      allowNull: true
    },
    mqttTopic: {
      type: DataTypes.STRING,
      allowNull: true
    },
    configuration: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Device-specific configuration'
    },
    credentials: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Encrypted device credentials'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'devices',
    timestamps: true,
    indexes: [
      { fields: ['deviceId'] },
      { fields: ['zoneId'] },
      { fields: ['status'] }
    ]
  });

  Device.associate = (models) => {
    Device.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });
  };

  return Device;
};


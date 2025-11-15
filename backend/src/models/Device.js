/**
 * CropWise - Device Model
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
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Organization for multi-tenant isolation'
    },
    unitId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Unit/building this device belongs to'
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Zone this device controls (for ESP32 controllers)'
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Physical device identifier (MAC address, serial, etc.)'
    },
    deviceType: {
      type: DataTypes.ENUM('esp32_controller', 'raspberry_pi_gateway', 'sensor', 'actuator'),
      allowNull: false,
      comment: 'Type of device'
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
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Device-specific configuration'
    },
    credentials: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Encrypted device credentials'
    },
    metadata: {
      type: DataTypes.JSON,
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
    Device.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
    Device.belongsTo(models.Unit, {
      foreignKey: 'unitId',
      as: 'unit'
    });
    Device.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });
  };

  return Device;
};


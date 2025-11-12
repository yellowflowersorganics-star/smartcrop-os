/**
 * Yellow Flowers SmartFarm Cloud - Unit Model
 * A Unit is a physical location/building within an organization
 * Each unit has one Raspberry Pi gateway and multiple zones
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Unit = sequelize.define('Unit', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Organization this unit belongs to'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Unit name (e.g., "Building A", "Farm North")'
    },
    unitCode: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Unique code for this unit (e.g., "BLD-A")'
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Physical location details',
      defaultValue: {}
    },
    unitType: {
      type: DataTypes.ENUM('building', 'farm', 'warehouse', 'facility', 'greenhouse'),
      defaultValue: 'building',
      comment: 'Type of physical unit'
    },
    totalArea: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Total area in square meters'
    },
    // Raspberry Pi Gateway information
    gatewayId: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: true,
      comment: 'Raspberry Pi device ID (MAC address or serial)'
    },
    gatewayStatus: {
      type: DataTypes.ENUM('online', 'offline', 'maintenance', 'error'),
      defaultValue: 'offline',
      comment: 'Current gateway connection status'
    },
    gatewayLastSeen: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time gateway connected'
    },
    gatewayIpAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Gateway local IP address'
    },
    gatewayVersion: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Gateway firmware/software version'
    },
    // Local MQTT configuration (for ESP32s to connect to Pi)
    localMqttBroker: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Local MQTT broker address (usually Pi IP)'
    },
    localMqttPort: {
      type: DataTypes.INTEGER,
      defaultValue: 1883,
      comment: 'Local MQTT broker port'
    },
    // Credentials for ESP32s to connect to local Pi
    localMqttCredentials: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Encrypted credentials for ESP32 → Pi connection'
    },
    // Network configuration
    networkConfig: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'WiFi SSID, network settings, etc.'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'maintenance', 'decommissioned'),
      defaultValue: 'active'
    },
    // Contact information
    contactPerson: {
      type: DataTypes.STRING,
      allowNull: true
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Statistics
    totalZones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of zones in this unit'
    },
    activeZones: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of currently active zones'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'units',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['gatewayId'] },
      { fields: ['status'] },
      { fields: ['gatewayStatus'] }
    ]
  });

  Unit.associate = (models) => {
    Unit.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
    Unit.hasMany(models.Zone, {
      foreignKey: 'unitId',
      as: 'zones'
    });
    Unit.hasMany(models.Device, {
      foreignKey: 'unitId',
      as: 'devices'
    });
  };

  // Instance methods
  Unit.prototype.isGatewayOnline = function() {
    if (!this.gatewayLastSeen) return false;
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.gatewayLastSeen > fiveMinutesAgo;
  };

  Unit.prototype.updateZoneCounts = async function() {
    const { Zone } = require('./index');
    const total = await Zone.count({ where: { unitId: this.id } });
    const active = await Zone.count({ 
      where: { 
        unitId: this.id,
        status: 'running'
      } 
    });
    
    await this.update({
      totalZones: total,
      activeZones: active
    });
  };

  return Unit;
};


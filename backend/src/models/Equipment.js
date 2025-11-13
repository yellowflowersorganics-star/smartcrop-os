const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Equipment = sequelize.define('Equipment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'zones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Zone this equipment belongs to'
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'ESP32 device identifier (e.g., ESP32-ZONE-A)'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Equipment name (e.g., Exhaust Fan, Humidifier)'
    },
    type: {
      type: DataTypes.ENUM(
        'fan',           // Exhaust/Circulation fan
        'humidifier',    // Humidifier/Fogger
        'heater',        // Heating element
        'cooler',        // Cooler/AC
        'light',         // Grow lights
        'pump',          // Irrigation/Fertigation pump
        'valve',         // CO2/Water valve
        'vfd',           // Variable Frequency Drive
        'relay',         // Generic relay
        'other'
      ),
      allowNull: false,
      comment: 'Equipment type'
    },
    controlType: {
      type: DataTypes.ENUM('relay', 'pwm', 'analog', 'digital'),
      allowNull: false,
      defaultValue: 'relay',
      comment: 'Control mechanism'
    },
    pin: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'GPIO pin number on ESP32'
    },
    status: {
      type: DataTypes.ENUM('on', 'off', 'auto', 'manual', 'error'),
      allowNull: false,
      defaultValue: 'off',
      comment: 'Current status'
    },
    mode: {
      type: DataTypes.ENUM('manual', 'auto', 'scheduled'),
      allowNull: false,
      defaultValue: 'auto',
      comment: 'Control mode'
    },
    currentValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Current value (0-100 for PWM, 0/1 for relay)'
    },
    targetValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Target value for auto mode'
    },
    minValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Minimum allowed value'
    },
    maxValue: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 100,
      comment: 'Maximum allowed value'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether equipment is active/enabled'
    },
    lastCommandTime: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time a command was sent'
    },
    lastStatusUpdate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time status was received from device'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional equipment-specific data'
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Owner of the equipment'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Organization for multi-tenant support'
    }
  }, {
    tableName: 'equipment',
    timestamps: true,
    indexes: [
      { fields: ['zoneId'] },
      { fields: ['deviceId'] },
      { fields: ['type'] },
      { fields: ['status'] },
      { fields: ['ownerId'] },
      { fields: ['organizationId'] }
    ]
  });

  Equipment.associate = (models) => {
    Equipment.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    Equipment.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    Equipment.hasMany(models.ControlCommand, {
      foreignKey: 'equipmentId',
      as: 'commands'
    });
  };

  return Equipment;
};


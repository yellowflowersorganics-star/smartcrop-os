const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ControlCommand = sequelize.define('ControlCommand', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    equipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'equipment',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Target equipment'
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
      comment: 'Zone where equipment is located'
    },
    commandType: {
      type: DataTypes.ENUM('turn_on', 'turn_off', 'set_value', 'set_mode', 'stop', 'start', 'reset'),
      allowNull: false,
      comment: 'Type of command'
    },
    value: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Value for set_value commands (e.g., fan speed %)'
    },
    mode: {
      type: DataTypes.ENUM('manual', 'auto', 'scheduled'),
      allowNull: true,
      comment: 'Mode for set_mode commands'
    },
    source: {
      type: DataTypes.ENUM('user', 'automation', 'schedule', 'recipe', 'api'),
      allowNull: false,
      defaultValue: 'user',
      comment: 'Who/what initiated the command'
    },
    status: {
      type: DataTypes.ENUM('pending', 'sent', 'acknowledged', 'completed', 'failed', 'timeout'),
      allowNull: false,
      defaultValue: 'pending',
      comment: 'Command execution status'
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When command was sent to device'
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When device acknowledged receipt'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When device completed execution'
    },
    errorMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Error message if command failed'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional command data'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who initiated command (if source is user)'
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
      comment: 'Owner of the zone/equipment'
    }
  }, {
    tableName: 'control_commands',
    timestamps: true,
    indexes: [
      { fields: ['equipmentId'] },
      { fields: ['zoneId'] },
      { fields: ['status'] },
      { fields: ['source'] },
      { fields: ['userId'] },
      { fields: ['ownerId'] },
      { fields: ['createdAt'] }
    ]
  });

  ControlCommand.associate = (models) => {
    ControlCommand.belongsTo(models.Equipment, {
      foreignKey: 'equipmentId',
      as: 'equipment'
    });

    ControlCommand.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    ControlCommand.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'initiator'
    });

    ControlCommand.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
  };

  return ControlCommand;
};


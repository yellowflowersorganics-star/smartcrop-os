const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define('Alert', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'User who receives this alert'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Organization for multi-tenant alerts'
    },
    type: {
      type: DataTypes.ENUM(
        'environmental',      // Temperature/humidity out of range
        'batch_milestone',    // Batch events (pinning, harvest ready)
        'inventory',          // Low stock alerts
        'equipment',          // Equipment failure/maintenance
        'system',             // System notifications
        'harvest_reminder',   // Time to harvest
        'task',               // Task reminders
        'success',            // Success messages
        'warning',            // Warning messages
        'error'               // Error messages
      ),
      allowNull: false,
      defaultValue: 'system'
    },
    severity: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Alert severity level'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Alert title/headline'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Alert message/description'
    },
    status: {
      type: DataTypes.ENUM('unread', 'read', 'dismissed', 'acknowledged'),
      allowNull: false,
      defaultValue: 'unread'
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'zones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related zone (optional)'
    },
    batchId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'batches',
        key: 'batchNumber'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related batch (optional)'
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'inventory_items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related inventory item (optional)'
    },
    deviceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'devices',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related device (optional)'
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL to navigate when alert is clicked'
    },
    actionLabel: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Label for action button'
    },
    readAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When alert was read'
    },
    dismissedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When alert was dismissed'
    },
    acknowledgedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When alert was acknowledged'
    },
    acknowledgedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User who acknowledged the alert'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Alert expiration time (auto-dismiss)'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional alert data (thresholds, values, etc.)'
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether email notification was sent'
    },
    smsSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether SMS notification was sent'
    },
    pushSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether push notification was sent'
    }
  }, {
    tableName: 'alerts',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['organizationId'] },
      { fields: ['type'] },
      { fields: ['severity'] },
      { fields: ['status'] },
      { fields: ['zoneId'] },
      { fields: ['batchId'] },
      { fields: ['createdAt'] },
      { fields: ['userId', 'status'] },
      { fields: ['userId', 'type'] }
    ]
  });

  Alert.associate = (models) => {
    Alert.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Alert.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    Alert.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    Alert.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    Alert.belongsTo(models.InventoryItem, {
      foreignKey: 'inventoryItemId',
      as: 'inventoryItem'
    });

    Alert.belongsTo(models.Device, {
      foreignKey: 'deviceId',
      as: 'device'
    });
  };

  return Alert;
};


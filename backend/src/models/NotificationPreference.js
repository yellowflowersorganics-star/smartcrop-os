const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NotificationPreference = sequelize.define('NotificationPreference', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'User these preferences belong to'
    },
    // In-app notification preferences
    inAppEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Enable in-app notifications'
    },
    // Email notification preferences
    emailEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Enable email notifications'
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Email address for notifications (defaults to user email)'
    },
    // SMS notification preferences
    smsEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Enable SMS notifications'
    },
    smsPhone: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Phone number for SMS notifications'
    },
    // Push notification preferences
    pushEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Enable push notifications'
    },
    pushTokens: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Device push notification tokens'
    },
    // Alert type preferences
    alertTypes: {
      type: DataTypes.JSON,
      defaultValue: {
        environmental: { inApp: true, email: true, sms: false, push: false },
        batch_milestone: { inApp: true, email: true, sms: false, push: false },
        inventory: { inApp: true, email: false, sms: false, push: false },
        equipment: { inApp: true, email: true, sms: false, push: false },
        system: { inApp: true, email: false, sms: false, push: false },
        harvest_reminder: { inApp: true, email: true, sms: false, push: false },
        task: { inApp: true, email: false, sms: false, push: false },
        success: { inApp: true, email: false, sms: false, push: false },
        warning: { inApp: true, email: true, sms: false, push: false },
        error: { inApp: true, email: true, sms: false, push: false }
      },
      comment: 'Notification preferences per alert type'
    },
    // Severity preferences
    severityThreshold: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
      defaultValue: 'low',
      comment: 'Minimum severity level to notify'
    },
    // Quiet hours
    quietHoursEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Enable quiet hours'
    },
    quietHoursStart: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Quiet hours start time (HH:MM format)'
    },
    quietHoursEnd: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Quiet hours end time (HH:MM format)'
    },
    quietHoursDays: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Days to apply quiet hours (0=Sunday, 6=Saturday)'
    },
    // Digest preferences
    digestEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Enable daily digest of alerts'
    },
    digestTime: {
      type: DataTypes.STRING,
      defaultValue: '09:00',
      comment: 'Time to send digest (HH:MM format)'
    },
    digestDays: {
      type: DataTypes.JSON,
      defaultValue: [1, 2, 3, 4, 5], // Mon-Fri
      comment: 'Days to send digest (0=Sunday, 6=Saturday)'
    },
    // Sound preferences
    soundEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Play sound for in-app notifications'
    },
    soundType: {
      type: DataTypes.STRING,
      defaultValue: 'default',
      comment: 'Sound type for notifications'
    },
    // Auto-dismiss settings
    autoDismissEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Auto-dismiss read notifications'
    },
    autoDismissAfter: {
      type: DataTypes.INTEGER,
      defaultValue: 24,
      comment: 'Hours after which to auto-dismiss (if enabled)'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional preference settings'
    }
  }, {
    tableName: 'notification_preferences',
    timestamps: true,
    indexes: [
      { fields: ['userId'], unique: true }
    ]
  });

  NotificationPreference.associate = (models) => {
    NotificationPreference.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  // Helper method to check if notification should be sent
  NotificationPreference.prototype.shouldNotify = function(alertType, channel, severity) {
    // Check if channel is enabled globally
    if (channel === 'email' && !this.emailEnabled) return false;
    if (channel === 'sms' && !this.smsEnabled) return false;
    if (channel === 'push' && !this.pushEnabled) return false;
    if (channel === 'inApp' && !this.inAppEnabled) return false;

    // Check severity threshold
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    const threshold = severityLevels[this.severityThreshold] || 1;
    const alertSeverity = severityLevels[severity] || 2;
    if (alertSeverity < threshold) return false;

    // Check alert type preferences
    const typePrefs = this.alertTypes[alertType];
    if (!typePrefs || !typePrefs[channel]) return false;

    // Check quiet hours
    if (this.quietHoursEnabled && channel !== 'inApp') {
      const now = new Date();
      const day = now.getDay();
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      if (this.quietHoursDays.includes(day)) {
        if (time >= this.quietHoursStart && time <= this.quietHoursEnd) {
          return false;
        }
      }
    }

    return true;
  };

  return NotificationPreference;
};


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkLog = sequelize.define('WorkLog', {
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
      comment: 'Worker/employee who performed the work'
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
      comment: 'Organization for multi-tenant'
    },
    workDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of work'
    },
    clockIn: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Clock in timestamp'
    },
    clockOut: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Clock out timestamp (null if still working)'
    },
    breakMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total break time in minutes'
    },
    totalHours: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Calculated total hours worked'
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Hourly pay rate for this work session'
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Calculated total labor cost'
    },
    workType: {
      type: DataTypes.ENUM(
        'regular',
        'overtime',
        'weekend',
        'holiday',
        'night_shift'
      ),
      defaultValue: 'regular',
      comment: 'Type of work shift'
    },
    // Associations
    taskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related task (optional)'
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
      comment: 'Zone where work was performed'
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
      comment: 'Batch related to work'
    },
    farmId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'farms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Farm where work was performed'
    },
    category: {
      type: DataTypes.ENUM(
        'monitoring',
        'maintenance',
        'harvesting',
        'inoculation',
        'cleaning',
        'packing',
        'delivery',
        'administrative',
        'other'
      ),
      defaultValue: 'other',
      comment: 'Work category'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Work description or notes'
    },
    status: {
      type: DataTypes.ENUM('active', 'completed', 'approved', 'rejected'),
      defaultValue: 'active',
      comment: 'Work log status'
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Supervisor who approved'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isOvertime: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this qualifies as overtime'
    },
    overtimeMultiplier: {
      type: DataTypes.FLOAT,
      defaultValue: 1.5,
      comment: 'Overtime pay multiplier'
    },
    photoUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Work evidence photos'
    },
    gpsLocation: {
      type: DataTypes.JSON,
      defaultValue: null,
      comment: 'GPS coordinates of clock in/out'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'work_logs',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['organizationId'] },
      { fields: ['workDate'] },
      { fields: ['status'] },
      { fields: ['zoneId'] },
      { fields: ['batchId'] },
      { fields: ['farmId'] },
      { fields: ['category'] },
      { fields: ['userId', 'workDate'] },
      { fields: ['workDate', 'status'] }
    ]
  });

  WorkLog.associate = (models) => {
    WorkLog.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'worker'
    });

    WorkLog.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });

    WorkLog.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    WorkLog.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task'
    });

    WorkLog.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    WorkLog.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    WorkLog.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });
  };

  // Instance methods
  WorkLog.prototype.calculateTotalHours = function() {
    if (!this.clockOut) return null;
    const clockIn = new Date(this.clockIn);
    const clockOut = new Date(this.clockOut);
    const milliseconds = clockOut - clockIn;
    const minutes = milliseconds / (1000 * 60);
    const hours = (minutes - (this.breakMinutes || 0)) / 60;
    return Math.max(0, parseFloat(hours.toFixed(2)));
  };

  WorkLog.prototype.calculateTotalCost = function() {
    const hours = this.calculateTotalHours();
    if (!hours || !this.hourlyRate) return null;
    
    let rate = parseFloat(this.hourlyRate);
    if (this.isOvertime) {
      rate = rate * (this.overtimeMultiplier || 1.5);
    }
    
    return parseFloat((hours * rate).toFixed(2));
  };

  // Hook to calculate before save
  WorkLog.beforeSave(async (workLog) => {
    if (workLog.clockOut) {
      workLog.totalHours = workLog.calculateTotalHours();
      workLog.totalCost = workLog.calculateTotalCost();
      
      if (workLog.status === 'active') {
        workLog.status = 'completed';
      }
    }
  });

  return WorkLog;
};


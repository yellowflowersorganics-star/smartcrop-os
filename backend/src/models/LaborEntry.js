const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const LaborEntry = sequelize.define('LaborEntry', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
      comment: 'User who created this entry'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Employee who worked'
    },
    // Time tracking
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of work'
    },
    clockIn: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Clock in time'
    },
    clockOut: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Clock out time'
    },
    hoursWorked: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Total hours worked'
    },
    overtimeHours: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 0,
      comment: 'Overtime hours'
    },
    breakHours: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 0,
      comment: 'Break time (unpaid)'
    },
    // Work details
    workType: {
      type: DataTypes.ENUM(
        'regular',
        'overtime',
        'weekend',
        'holiday',
        'night_shift',
        'training'
      ),
      defaultValue: 'regular',
      comment: 'Type of work shift'
    },
    activityType: {
      type: DataTypes.ENUM(
        'monitoring',
        'maintenance',
        'harvesting',
        'inoculation',
        'cleaning',
        'packing',
        'quality_control',
        'setup',
        'training',
        'administrative',
        'other'
      ),
      allowNull: false,
      defaultValue: 'other',
      comment: 'Type of activity performed'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Description of work performed'
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
      comment: 'Related batch'
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
      comment: 'Related farm'
    },
    // Cost calculation
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Hourly rate at time of entry'
    },
    overtimeRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Overtime rate at time of entry'
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Total labor cost for this entry'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    // Status and approval
    status: {
      type: DataTypes.ENUM('draft', 'submitted', 'approved', 'rejected', 'paid'),
      defaultValue: 'submitted',
      comment: 'Entry status'
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
      comment: 'User who approved this entry'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Additional data
    location: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'GPS location or area description'
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Photo or document attachments'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'labor_entries',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['employeeId'] },
      { fields: ['date'] },
      { fields: ['status'] },
      { fields: ['activityType'] },
      { fields: ['taskId'] },
      { fields: ['zoneId'] },
      { fields: ['batchId'] },
      { fields: ['farmId'] },
      { fields: ['employeeId', 'date'] },
      { fields: ['date', 'status'] }
    ]
  });

  LaborEntry.associate = (models) => {
    LaborEntry.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    LaborEntry.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    LaborEntry.belongsTo(models.Employee, {
      foreignKey: 'employeeId',
      as: 'employee'
    });

    LaborEntry.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });

    LaborEntry.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task'
    });

    LaborEntry.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    LaborEntry.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    LaborEntry.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });
  };

  // Calculate total cost
  LaborEntry.prototype.calculateCost = function() {
    const regularCost = parseFloat(this.hourlyRate) * parseFloat(this.hoursWorked);
    const overtimeCost = this.overtimeRate && this.overtimeHours 
      ? parseFloat(this.overtimeRate) * parseFloat(this.overtimeHours)
      : 0;
    return regularCost + overtimeCost;
  };

  return LaborEntry;
};


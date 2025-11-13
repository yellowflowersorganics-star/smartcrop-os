const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
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
      comment: 'User who created this employee record'
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
      comment: 'Organization this employee belongs to'
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
      comment: 'Linked user account (if employee has system access)'
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Human-readable employee ID'
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM(
        'farm_manager',
        'supervisor',
        'technician',
        'harvester',
        'quality_control',
        'maintenance',
        'cleaner',
        'packer',
        'driver',
        'other'
      ),
      allowNull: false,
      defaultValue: 'technician',
      comment: 'Employee job role'
    },
    department: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Department or team'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated'),
      defaultValue: 'active'
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of hire'
    },
    terminationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of termination'
    },
    // Compensation
    payType: {
      type: DataTypes.ENUM('hourly', 'daily', 'monthly', 'salary'),
      defaultValue: 'hourly',
      comment: 'How employee is paid'
    },
    payRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Pay rate (per hour, day, or month based on payType)'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
      comment: 'Currency for pay rate'
    },
    overtimeRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Overtime hourly rate'
    },
    // Working hours
    standardHoursPerDay: {
      type: DataTypes.DECIMAL(4, 2),
      defaultValue: 8.0,
      comment: 'Standard working hours per day'
    },
    standardDaysPerWeek: {
      type: DataTypes.INTEGER,
      defaultValue: 6,
      comment: 'Standard working days per week'
    },
    // Skills and certifications
    skills: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of skills/competencies'
    },
    certifications: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of certifications with expiry dates'
    },
    // Contact and personal
    address: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Employee address'
    },
    emergencyContact: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Emergency contact information'
    },
    // Documentation
    documents: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of document URLs (ID, contracts, etc.)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about employee'
    },
    // Performance
    performanceRating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      comment: 'Performance rating (0-5)'
    },
    lastReviewDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of last performance review'
    },
    // System
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'employees',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['userId'] },
      { fields: ['employeeId'] },
      { fields: ['status'] },
      { fields: ['role'] },
      { fields: ['isActive'] },
      { fields: ['ownerId', 'status'] }
    ]
  });

  Employee.associate = (models) => {
    Employee.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    Employee.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    Employee.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    Employee.hasMany(models.LaborEntry, {
      foreignKey: 'employeeId',
      as: 'laborEntries'
    });
  };

  // Virtual for full name
  Employee.prototype.getFullName = function() {
    return `${this.firstName} ${this.lastName}`;
  };

  // Calculate total labor cost
  Employee.prototype.calculateLaborCost = function(hours) {
    if (this.payType === 'hourly') {
      return parseFloat(this.payRate) * hours;
    } else if (this.payType === 'daily') {
      const days = hours / this.standardHoursPerDay;
      return parseFloat(this.payRate) * days;
    } else if (this.payType === 'monthly') {
      const hoursPerMonth = this.standardHoursPerDay * this.standardDaysPerWeek * 4.33;
      return (parseFloat(this.payRate) / hoursPerMonth) * hours;
    }
    return 0;
  };

  return Employee;
};


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Employee = sequelize.define('Employee', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    // Basic Information
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique employee ID (e.g., EMP-001)'
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Employee first name'
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Employee last name'
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
      comment: 'Employee email address'
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Primary phone number'
    },
    whatsappNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'WhatsApp number for notifications (with country code)'
    },
    photoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Profile photo URL'
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of birth'
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true,
      comment: 'Gender'
    },
    
    // Address
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Full address'
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pincode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    
    // Employment Details
    roleId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Role assigned to employee'
    },
    departmentId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Department the employee belongs to'
    },
    joinDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Date of joining'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Date of leaving (if terminated)'
    },
    employmentType: {
      type: DataTypes.ENUM('full-time', 'part-time', 'contract', 'temporary'),
      defaultValue: 'full-time',
      comment: 'Type of employment'
    },
    shiftType: {
      type: DataTypes.ENUM('day', 'night', 'rotating'),
      defaultValue: 'day',
      comment: 'Shift type'
    },
    
    // Compensation
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Monthly salary (if applicable)'
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Hourly rate (if applicable)'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
      comment: 'Currency code'
    },
    
    // Documents
    documents: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of document objects (ID proof, contracts, etc.)'
    },
    
    // Status & Settings
    status: {
      type: DataTypes.ENUM('active', 'on-leave', 'suspended', 'terminated'),
      defaultValue: 'active',
      comment: 'Employment status'
    },
    canLogin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether employee can login to system'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Linked user account (if canLogin is true)'
    },
    
    // Notifications
    notificationPreferences: {
      type: DataTypes.JSON,
      defaultValue: {
        whatsapp: true,
        sms: false,
        email: true,
        push: true
      },
      comment: 'Notification channel preferences'
    },
    
    // Ownership
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'Farm owner who created this employee record'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Organization for multi-tenant isolation'
    },
    
    // Additional Info
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about employee'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata (emergency contacts, skills, etc.)'
    }
  }, {
    tableName: 'employees',
    timestamps: true,
    indexes: [
      { fields: ['employeeId'], unique: true },
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['roleId'] },
      { fields: ['departmentId'] },
      { fields: ['status'] },
      { fields: ['email'] },
      { fields: ['phone'] }
    ]
  });

  Employee.associate = (models) => {
    // Employee belongs to a role
    Employee.belongsTo(models.Role, {
      foreignKey: 'roleId',
      as: 'role'
    });

    // Employee belongs to a department
    Employee.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department'
    });

    // Employee can have many tasks
    Employee.hasMany(models.Task, {
      foreignKey: 'assignedEmployeeId',
      as: 'tasks'
    });

    // Employee can have many work logs
    Employee.hasMany(models.WorkLog, {
      foreignKey: 'employeeId',
      as: 'workLogs'
    });

    // Employee may be linked to a user account
    Employee.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Employee;
};

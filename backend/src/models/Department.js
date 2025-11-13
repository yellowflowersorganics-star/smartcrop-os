const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Department = sequelize.define('Department', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Department name (e.g., Harvesting, Packaging, Sales)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Department description and responsibilities'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Department code (e.g., HRVST, PKG, SALES)'
    },
    managerId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Employee who manages this department'
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'User who owns this department (farm owner)'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Organization for multi-tenant isolation'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: 'Department status'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata (budget, KPIs, etc.)'
    }
  }, {
    tableName: 'departments',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['status'] }
    ]
  });

  Department.associate = (models) => {
    // A department has many employees
    Department.hasMany(models.Employee, {
      foreignKey: 'departmentId',
      as: 'employees'
    });

    // A department has a manager (employee)
    Department.belongsTo(models.Employee, {
      foreignKey: 'managerId',
      as: 'manager'
    });
  };

  return Department;
};


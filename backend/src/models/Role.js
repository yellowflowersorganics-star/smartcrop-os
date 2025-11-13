const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Role = sequelize.define('Role', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Role name (e.g., Farm Manager, Harvester)'
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      comment: 'Unique role code (e.g., FARM_MANAGER, HARVESTER)'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Role description and responsibilities'
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Permission settings for this role'
    },
    level: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Role hierarchy level (1=lowest, 10=highest)'
    },
    isSystemRole: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a predefined system role'
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'User who created custom role (null for system roles)'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Organization for multi-tenant isolation'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive'),
      defaultValue: 'active',
      comment: 'Role status'
    }
  }, {
    tableName: 'roles',
    timestamps: true,
    indexes: [
      { fields: ['code'], unique: true },
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['isSystemRole'] }
    ]
  });

  Role.associate = (models) => {
    // A role has many employees
    Role.hasMany(models.Employee, {
      foreignKey: 'roleId',
      as: 'employees'
    });
  };

  return Role;
};


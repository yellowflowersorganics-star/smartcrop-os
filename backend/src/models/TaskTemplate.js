const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const TaskTemplate = sequelize.define('TaskTemplate', {
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
      comment: 'User who created the template'
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
      comment: 'Organization for multi-tenant templates'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Template name'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Template description'
    },
    category: {
      type: DataTypes.ENUM(
        'monitoring',
        'maintenance',
        'watering',
        'harvesting',
        'inoculation',
        'cleaning',
        'inspection',
        'inventory',
        'setup',
        'documentation',
        'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    // Default task properties
    defaultTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Default task title'
    },
    defaultDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    defaultPriority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      defaultValue: 'medium'
    },
    defaultEstimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Default estimated duration in minutes'
    },
    defaultChecklist: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Default checklist items'
    },
    // Recurrence defaults
    defaultRecurrence: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom', 'none'),
      defaultValue: 'none'
    },
    defaultRecurrenceInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    defaultRecurrenceDays: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    // Template settings
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether template is shared publicly'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether template is active'
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Number of times template was used'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Template tags for categorization'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional template data'
    }
  }, {
    tableName: 'task_templates',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['category'] },
      { fields: ['isPublic'] },
      { fields: ['isActive'] }
    ]
  });

  TaskTemplate.associate = (models) => {
    TaskTemplate.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    TaskTemplate.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    TaskTemplate.hasMany(models.Task, {
      foreignKey: 'templateId',
      as: 'tasks'
    });
  };

  return TaskTemplate;
};


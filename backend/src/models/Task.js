const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Task = sequelize.define('Task', {
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
      comment: 'User who created the task'
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'User assigned to complete the task'
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
      comment: 'Organization for multi-tenant tasks'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Task title'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Detailed task description'
    },
    category: {
      type: DataTypes.ENUM(
        'monitoring',        // Daily monitoring tasks
        'maintenance',       // Equipment maintenance
        'watering',          // Watering/misting
        'harvesting',        // Harvest tasks
        'inoculation',       // Inoculation tasks
        'cleaning',          // Cleaning/sanitization
        'inspection',        // Quality inspection
        'inventory',         // Inventory management
        'setup',             // Zone/batch setup
        'documentation',     // Record keeping
        'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled', 'overdue'),
      allowNull: false,
      defaultValue: 'pending'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When the task is due'
    },
    dueTime: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Time task is due (HH:MM format)'
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Estimated duration in minutes'
    },
    actualDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Actual time taken in minutes'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    // Associations
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
    farmId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'farms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related farm (optional)'
    },
    // Recurrence
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a recurring task'
    },
    recurrencePattern: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'custom'),
      allowNull: true,
      comment: 'Recurrence frequency'
    },
    recurrenceInterval: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Recurrence interval (e.g., every 2 days)'
    },
    recurrenceDays: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Days of week for weekly recurrence (0=Sunday, 6=Saturday)'
    },
    recurrenceEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When recurrence should stop'
    },
    parentTaskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Parent task if this was generated from recurrence'
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'task_templates',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Template this task was created from'
    },
    // Checklist
    checklist: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of checklist items { id, text, completed }'
    },
    // Notifications
    reminderEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Send reminder notifications'
    },
    reminderBefore: {
      type: DataTypes.INTEGER,
      defaultValue: 60,
      comment: 'Minutes before due time to send reminder'
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    // Completion notes
    completionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes added when completing the task'
    },
    // Attachments
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of attachment URLs'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of tags for categorization'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional task data'
    }
  }, {
    tableName: 'tasks',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['assignedTo'] },
      { fields: ['organizationId'] },
      { fields: ['category'] },
      { fields: ['priority'] },
      { fields: ['status'] },
      { fields: ['dueDate'] },
      { fields: ['zoneId'] },
      { fields: ['batchId'] },
      { fields: ['farmId'] },
      { fields: ['isRecurring'] },
      { fields: ['parentTaskId'] },
      { fields: ['templateId'] },
      { fields: ['ownerId', 'status'] },
      { fields: ['ownerId', 'dueDate'] }
    ]
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    Task.belongsTo(models.User, {
      foreignKey: 'assignedTo',
      as: 'assignee'
    });

    Task.belongsTo(models.User, {
      foreignKey: 'completedBy',
      as: 'completedByUser'
    });

    Task.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    Task.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    Task.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    Task.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });

    Task.belongsTo(models.Task, {
      foreignKey: 'parentTaskId',
      as: 'parentTask'
    });

    Task.hasMany(models.Task, {
      foreignKey: 'parentTaskId',
      as: 'childTasks'
    });
  };

  // Check if task is overdue
  Task.prototype.isOverdue = function() {
    if (!this.dueDate || this.status === 'completed' || this.status === 'cancelled') {
      return false;
    }
    return new Date() > new Date(this.dueDate);
  };

  // Calculate completion percentage from checklist
  Task.prototype.getChecklistProgress = function() {
    if (!this.checklist || this.checklist.length === 0) {
      return null;
    }
    const completed = this.checklist.filter(item => item.completed).length;
    return Math.round((completed / this.checklist.length) * 100);
  };

  return Task;
};


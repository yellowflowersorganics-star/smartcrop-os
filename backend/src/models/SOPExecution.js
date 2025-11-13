const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const SOPExecution = sequelize.define('SOPExecution', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    sopId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'sops',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
      comment: 'SOP being executed'
    },
    sopVersion: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Version of SOP being executed'
    },
    executedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
      comment: 'User executing the SOP'
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
    // Context
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'zones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Zone where SOP was executed (if applicable)'
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
      comment: 'Related batch (if applicable)'
    },
    farmId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'farms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'tasks',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related task (if SOP was part of a task)'
    },
    // Timing
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When execution started'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When execution was completed'
    },
    pausedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When execution was paused'
    },
    totalDuration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Total time taken (minutes)'
    },
    pauseDuration: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'Total pause time (minutes)'
    },
    // Status
    status: {
      type: DataTypes.ENUM('in_progress', 'paused', 'completed', 'failed', 'cancelled', 'pending_review'),
      defaultValue: 'in_progress',
      comment: 'Execution status'
    },
    completionPercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
      comment: 'Percentage completed (0-100)'
    },
    currentStep: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Current step number'
    },
    // Results
    outcome: {
      type: DataTypes.ENUM('success', 'partial_success', 'failure', 'needs_rework'),
      allowNull: true,
      comment: 'Final outcome'
    },
    successCriteriaMet: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      comment: 'Whether acceptance criteria were met'
    },
    qualityScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      },
      comment: 'Quality score (0-100)'
    },
    // Step Completion Data
    stepData: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Data collected at each step'
    },
    completedSteps: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'List of completed step IDs'
    },
    skippedSteps: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Steps that were skipped with reasons'
    },
    // Issues & Deviations
    issues: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Issues encountered during execution'
    },
    deviations: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Deviations from standard procedure'
    },
    correctiveActions: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Corrective actions taken'
    },
    // Notes & Observations
    executorNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notes from the executor'
    },
    observations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observations made during execution'
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Recommendations for improvement'
    },
    // Verification & Approval
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Supervisor who verified execution'
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verificationNotes: {
      type: DataTypes.TEXT,
      allowNull: true
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
      comment: 'Manager who approved execution'
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    approvalNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    // Environmental Conditions
    environmentalData: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Environmental conditions during execution'
    },
    // Documentation
    photos: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Photos taken during execution'
    },
    signatures: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Digital signatures (executor, verifier, approver)'
    },
    attachments: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Additional attachments'
    },
    // Training & Compliance
    trainingCertified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether executor is certified/trained'
    },
    complianceChecked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether compliance requirements were checked'
    },
    // Rating & Feedback
    executorRating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 1,
        max: 5
      },
      comment: 'Executor rating of the SOP (1-5)'
    },
    executorFeedback: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Feedback on the SOP from executor'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'sop_executions',
    timestamps: true,
    indexes: [
      { fields: ['sopId'] },
      { fields: ['executedBy'] },
      { fields: ['organizationId'] },
      { fields: ['status'] },
      { fields: ['outcome'] },
      { fields: ['startedAt'] },
      { fields: ['completedAt'] },
      { fields: ['zoneId'] },
      { fields: ['batchId'] },
      { fields: ['taskId'] }
    ]
  });

  SOPExecution.associate = (models) => {
    SOPExecution.belongsTo(models.SOP, {
      foreignKey: 'sopId',
      as: 'sop'
    });

    SOPExecution.belongsTo(models.User, {
      foreignKey: 'executedBy',
      as: 'executor'
    });

    SOPExecution.belongsTo(models.User, {
      foreignKey: 'verifiedBy',
      as: 'verifier'
    });

    SOPExecution.belongsTo(models.User, {
      foreignKey: 'approvedBy',
      as: 'approver'
    });

    SOPExecution.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    SOPExecution.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    SOPExecution.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    SOPExecution.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });

    SOPExecution.belongsTo(models.Task, {
      foreignKey: 'taskId',
      as: 'task'
    });
  };

  // Instance method to calculate duration
  SOPExecution.prototype.calculateDuration = function() {
    if (!this.completedAt || !this.startedAt) return null;
    
    const start = new Date(this.startedAt);
    const end = new Date(this.completedAt);
    const durationMs = end - start;
    const durationMinutes = Math.floor(durationMs / 60000);
    
    return durationMinutes - (this.pauseDuration || 0);
  };

  // Hook to calculate duration before save
  SOPExecution.beforeSave(async (execution) => {
    if (execution.completedAt && execution.startedAt) {
      execution.totalDuration = execution.calculateDuration();
    }
  });

  return SOPExecution;
};


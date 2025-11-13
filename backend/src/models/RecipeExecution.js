const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const RecipeExecution = sequelize.define('RecipeExecution', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'zones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Zone where recipe is being executed'
    },
    recipeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'crop_recipes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
      comment: 'Recipe being executed'
    },
    batchNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'batches',
        key: 'batchNumber'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Associated batch'
    },
    currentStage: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current stage index'
    },
    status: {
      type: DataTypes.ENUM('active', 'paused', 'waiting_approval', 'completed', 'aborted'),
      allowNull: false,
      defaultValue: 'active',
      comment: 'Execution status'
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'When execution started'
    },
    currentStageStartedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When current stage started'
    },
    expectedStageEndDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expected end date for current stage (estimated)'
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When execution completed'
    },
    stageHistory: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Array of stage completion records [{stage, startedAt, completedAt, approvedBy, notes}]'
    },
    pendingApproval: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Pending approval request {stage, requestedAt, message, manualTasks}'
    },
    approvalRequestedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'When approval was last requested'
    },
    autoEnvironmentControl: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether to automatically control environment based on recipe'
    },
    equipmentOverrides: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Manual equipment overrides {equipmentId: {mode, value}}'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Execution notes'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional execution data'
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
      comment: 'Owner'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Organization'
    }
  }, {
    tableName: 'recipe_executions',
    timestamps: true,
    indexes: [
      { fields: ['zoneId'] },
      { fields: ['recipeId'] },
      { fields: ['batchNumber'] },
      { fields: ['status'] },
      { fields: ['currentStage'] },
      { fields: ['ownerId'] }
    ]
  });

  RecipeExecution.associate = (models) => {
    RecipeExecution.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    RecipeExecution.belongsTo(models.CropRecipe, {
      foreignKey: 'recipeId',
      as: 'recipe'
    });

    RecipeExecution.belongsTo(models.Batch, {
      foreignKey: 'batchNumber',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    RecipeExecution.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });
  };

  // Instance methods
  RecipeExecution.prototype.getCurrentStageData = async function() {
    const recipe = await this.getRecipe();
    if (!recipe || !recipe.stages || !recipe.stages[this.currentStage]) {
      return null;
    }
    return recipe.stages[this.currentStage];
  };

  RecipeExecution.prototype.getProgress = function() {
    if (!this.recipe || !this.recipe.stages) return 0;
    const totalStages = this.recipe.stages.length;
    return Math.round((this.currentStage / totalStages) * 100);
  };

  RecipeExecution.prototype.getDaysInCurrentStage = function() {
    if (!this.currentStageStartedAt) return 0;
    const now = new Date();
    const stageStart = new Date(this.currentStageStartedAt);
    const diffTime = Math.abs(now - stageStart);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return RecipeExecution;
};


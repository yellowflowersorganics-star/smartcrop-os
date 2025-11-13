const { RecipeExecution, CropRecipe, Zone, Batch } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const recipeExecutionService = require('../services/recipeExecution.service');

class RecipeExecutionController {
  constructor() {
    this.startExecution = this.startExecution.bind(this);
    this.getAllExecutions = this.getAllExecutions.bind(this);
    this.getExecutionById = this.getExecutionById.bind(this);
    this.getZoneExecution = this.getZoneExecution.bind(this);
    this.approveStageTransition = this.approveStageTransition.bind(this);
    this.declineStageTransition = this.declineStageTransition.bind(this);
    this.pauseExecution = this.pauseExecution.bind(this);
    this.resumeExecution = this.resumeExecution.bind(this);
    this.abortExecution = this.abortExecution.bind(this);
    this.getExecutionProgress = this.getExecutionProgress.bind(this);
  }

  /**
   * Start recipe execution in a zone
   * @route POST /api/recipe-execution/start
   */
  async startExecution(req, res) {
    try {
      const { id: userId } = req.user;
      const { zoneId, recipeId, batchNumber } = req.body;

      if (!zoneId || !recipeId) {
        return res.status(400).json({
          success: false,
          message: 'Zone ID and Recipe ID are required'
        });
      }

      const execution = await recipeExecutionService.startExecution(
        zoneId,
        recipeId,
        batchNumber,
        userId
      );

      return res.status(201).json({
        success: true,
        message: 'Recipe execution started successfully',
        execution
      });

    } catch (error) {
      logger.error('Error starting recipe execution:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to start recipe execution'
      });
    }
  }

  /**
   * Get all recipe executions for user
   * @route GET /api/recipe-execution
   */
  async getAllExecutions(req, res) {
    try {
      const { id: userId } = req.user;
      const { status, zoneId } = req.query;

      const where = { ownerId: userId };
      if (status) where.status = status;
      if (zoneId) where.zoneId = zoneId;

      const executions = await RecipeExecution.findAll({
        where,
        include: [
          {
            model: CropRecipe,
            as: 'recipe',
            attributes: ['id', 'cropName', 'stages']
          },
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name', 'type', 'deviceId']
          },
          {
            model: Batch,
            as: 'batch',
            attributes: ['batchNumber', 'cropName', 'status']
          }
        ],
        order: [['createdAt', 'DESC']]
      });

      return res.status(200).json({
        success: true,
        count: executions.length,
        executions
      });

    } catch (error) {
      logger.error('Error fetching recipe executions:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recipe executions'
      });
    }
  }

  /**
   * Get recipe execution by ID
   * @route GET /api/recipe-execution/:id
   */
  async getExecutionById(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const execution = await RecipeExecution.findOne({
        where: { id, ownerId: userId },
        include: [
          {
            model: CropRecipe,
            as: 'recipe'
          },
          {
            model: Zone,
            as: 'zone'
          },
          {
            model: Batch,
            as: 'batch'
          }
        ]
      });

      if (!execution) {
        return res.status(404).json({
          success: false,
          message: 'Recipe execution not found'
        });
      }

      // Add computed fields
      const executionData = execution.toJSON();
      executionData.progress = execution.getProgress();
      executionData.daysInCurrentStage = execution.getDaysInCurrentStage();

      return res.status(200).json({
        success: true,
        execution: executionData
      });

    } catch (error) {
      logger.error('Error fetching recipe execution:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch recipe execution'
      });
    }
  }

  /**
   * Get active recipe execution for a zone
   * @route GET /api/recipe-execution/zone/:zoneId
   */
  async getZoneExecution(req, res) {
    try {
      const { zoneId } = req.params;
      const { id: userId } = req.user;

      const execution = await RecipeExecution.findOne({
        where: {
          zoneId,
          ownerId: userId,
          status: { [Op.in]: ['active', 'paused', 'waiting_approval'] }
        },
        include: [
          {
            model: CropRecipe,
            as: 'recipe'
          },
          {
            model: Zone,
            as: 'zone'
          }
        ]
      });

      if (!execution) {
        return res.status(404).json({
          success: false,
          message: 'No active recipe execution found for this zone'
        });
      }

      const executionData = execution.toJSON();
      executionData.progress = execution.getProgress();
      executionData.daysInCurrentStage = execution.getDaysInCurrentStage();

      return res.status(200).json({
        success: true,
        execution: executionData
      });

    } catch (error) {
      logger.error('Error fetching zone execution:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch zone execution'
      });
    }
  }

  /**
   * Approve stage transition
   * @route POST /api/recipe-execution/:id/approve
   */
  async approveStageTransition(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const { notes, manualTasksCompleted } = req.body;

      const execution = await recipeExecutionService.approveStageTransition(
        id,
        userId,
        {
          approved: true,
          notes,
          manualTasksCompleted: manualTasksCompleted !== false
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Stage transition approved successfully',
        execution
      });

    } catch (error) {
      logger.error('Error approving stage transition:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve stage transition'
      });
    }
  }

  /**
   * Decline stage transition (continue current stage)
   * @route POST /api/recipe-execution/:id/decline
   */
  async declineStageTransition(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;
      const { notes } = req.body;

      const execution = await recipeExecutionService.approveStageTransition(
        id,
        userId,
        {
          approved: false,
          notes
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Stage extension confirmed',
        execution
      });

    } catch (error) {
      logger.error('Error declining stage transition:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to decline stage transition'
      });
    }
  }

  /**
   * Pause recipe execution
   * @route POST /api/recipe-execution/:id/pause
   */
  async pauseExecution(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const execution = await recipeExecutionService.pauseExecution(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Recipe execution paused',
        execution
      });

    } catch (error) {
      logger.error('Error pausing execution:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to pause execution'
      });
    }
  }

  /**
   * Resume recipe execution
   * @route POST /api/recipe-execution/:id/resume
   */
  async resumeExecution(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const execution = await recipeExecutionService.resumeExecution(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Recipe execution resumed',
        execution
      });

    } catch (error) {
      logger.error('Error resuming execution:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to resume execution'
      });
    }
  }

  /**
   * Abort recipe execution
   * @route POST /api/recipe-execution/:id/abort
   */
  async abortExecution(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const execution = await recipeExecutionService.abortExecution(id, userId);

      return res.status(200).json({
        success: true,
        message: 'Recipe execution aborted',
        execution
      });

    } catch (error) {
      logger.error('Error aborting execution:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to abort execution'
      });
    }
  }

  /**
   * Get execution progress summary
   * @route GET /api/recipe-execution/:id/progress
   */
  async getExecutionProgress(req, res) {
    try {
      const { id } = req.params;
      const { id: userId } = req.user;

      const execution = await RecipeExecution.findOne({
        where: { id, ownerId: userId },
        include: [
          {
            model: CropRecipe,
            as: 'recipe'
          },
          {
            model: Zone,
            as: 'zone'
          }
        ]
      });

      if (!execution) {
        return res.status(404).json({
          success: false,
          message: 'Recipe execution not found'
        });
      }

      const recipe = execution.recipe;
      const currentStage = recipe.stages[execution.currentStage];

      const progress = {
        executionId: execution.id,
        cropName: recipe.cropName,
        zoneName: execution.zone.name,
        status: execution.status,
        overallProgress: execution.getProgress(),
        currentStage: {
          index: execution.currentStage,
          name: currentStage?.name,
          daysInStage: execution.getDaysInCurrentStage(),
          expectedDuration: `${currentStage?.duration || 0}-${currentStage?.maxDuration || currentStage?.duration + 5 || 0}`,
          pendingApproval: execution.status === 'waiting_approval',
          approvalRequest: execution.pendingApproval
        },
        totalStages: recipe.stages.length,
        completedStages: execution.stageHistory?.length || 0,
        stageHistory: execution.stageHistory || [],
        startedAt: execution.startedAt,
        estimatedCompletion: null // Could calculate based on remaining stages
      };

      return res.status(200).json({
        success: true,
        progress
      });

    } catch (error) {
      logger.error('Error fetching execution progress:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch execution progress'
      });
    }
  }
}

module.exports = new RecipeExecutionController();


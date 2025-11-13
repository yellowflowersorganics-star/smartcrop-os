/**
 * SOP Execution Controller
 * Manages SOP execution tracking and progress
 */

const { SOPExecution, SOP, SOPStep, User, Zone, Batch } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class SOPExecutionController {
  constructor() {
    // Bind methods
    this.startExecution = this.startExecution.bind(this);
    this.updateExecution = this.updateExecution.bind(this);
    this.completeExecution = this.completeExecution.bind(this);
    this.completeStep = this.completeStep.bind(this);
    this.getAllExecutions = this.getAllExecutions.bind(this);
    this.getExecutionById = this.getExecutionById.bind(this);
    this.getMyExecutions = this.getMyExecutions.bind(this);
  }

  /**
   * Start a new SOP execution
   */
  async startExecution(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { sopId, zoneId, batchId, farmId, taskId } = req.body;

      // Fetch SOP with steps
      const sop = await SOP.findByPk(sopId, {
        include: [{ model: SOPStep, as: 'steps' }]
      });

      if (!sop) {
        return res.status(404).json({ error: 'SOP not found' });
      }

      if (sop.status !== 'active') {
        return res.status(400).json({ error: 'SOP must be active to execute' });
      }

      // Create execution
      const execution = await SOPExecution.create({
        sopId,
        sopVersion: sop.version,
        executedBy: userId,
        organizationId: organizationId || null,
        zoneId: zoneId || null,
        batchId: batchId || null,
        farmId: farmId || null,
        taskId: taskId || null,
        startedAt: new Date(),
        status: 'in_progress',
        currentStep: 1,
        completionPercentage: 0,
        stepData: {},
        completedSteps: [],
        skippedSteps: []
      });

      // Update SOP execution count
      await sop.increment('executionCount');
      await sop.update({ lastExecutedAt: new Date() });

      // Fetch complete execution
      const completeExecution = await SOPExecution.findByPk(execution.id, {
        include: [
          { model: SOP, as: 'sop', include: [{ model: SOPStep, as: 'steps' }] },
          { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] }
        ]
      });

      logger.info(`Started SOP execution ${execution.id} for SOP ${sopId}`);

      res.status(201).json(completeExecution);
    } catch (error) {
      logger.error('Error starting SOP execution:', error);
      res.status(500).json({ error: 'Failed to start SOP execution' });
    }
  }

  /**
   * Update execution progress
   */
  async updateExecution(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updateData = req.body;

      const execution = await SOPExecution.findOne({
        where: { id, executedBy: userId }
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }

      if (execution.status === 'completed') {
        return res.status(400).json({ error: 'Cannot update completed execution' });
      }

      await execution.update(updateData);

      logger.info(`Updated SOP execution ${id}`);

      res.json(execution);
    } catch (error) {
      logger.error('Error updating execution:', error);
      res.status(500).json({ error: 'Failed to update execution' });
    }
  }

  /**
   * Complete a step in the execution
   */
  async completeStep(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { stepNumber, stepData, skipped = false } = req.body;

      const execution = await SOPExecution.findOne({
        where: { id, executedBy: userId },
        include: [{ model: SOP, as: 'sop', include: [{ model: SOPStep, as: 'steps' }] }]
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }

      if (execution.status !== 'in_progress') {
        return res.status(400).json({ error: 'Execution is not in progress' });
      }

      const totalSteps = execution.sop.steps.length;
      const completedSteps = execution.completedSteps || [];
      const skippedSteps = execution.skippedSteps || [];

      // Add step to completed or skipped
      if (skipped) {
        if (!skippedSteps.includes(stepNumber)) {
          skippedSteps.push(stepNumber);
        }
      } else {
        if (!completedSteps.includes(stepNumber)) {
          completedSteps.push(stepNumber);
        }
      }

      // Update step data
      const currentStepData = execution.stepData || {};
      currentStepData[stepNumber] = stepData || {};

      // Calculate completion percentage
      const completionPercentage = Math.round(
        ((completedSteps.length + skippedSteps.length) / totalSteps) * 100
      );

      // Determine next step
      const currentStep = stepNumber + 1 <= totalSteps ? stepNumber + 1 : stepNumber;

      await execution.update({
        completedSteps,
        skippedSteps,
        stepData: currentStepData,
        currentStep,
        completionPercentage
      });

      logger.info(`Completed step ${stepNumber} in execution ${id}`);

      res.json(execution);
    } catch (error) {
      logger.error('Error completing step:', error);
      res.status(500).json({ error: 'Failed to complete step' });
    }
  }

  /**
   * Complete entire execution
   */
  async completeExecution(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const {
        outcome,
        successCriteriaMet,
        qualityScore,
        executorNotes,
        observations
      } = req.body;

      const execution = await SOPExecution.findOne({
        where: { id, executedBy: userId }
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }

      if (execution.status === 'completed') {
        return res.status(400).json({ error: 'Execution already completed' });
      }

      const completedAt = new Date();
      const totalDuration = Math.floor((completedAt - new Date(execution.startedAt)) / 60000); // minutes

      await execution.update({
        status: 'completed',
        completedAt,
        totalDuration,
        completionPercentage: 100,
        outcome: outcome || 'success',
        successCriteriaMet: successCriteriaMet !== undefined ? successCriteriaMet : true,
        qualityScore,
        executorNotes,
        observations
      });

      // Update SOP average completion time
      const sop = await SOP.findByPk(execution.sopId);
      if (sop) {
        const allExecutions = await SOPExecution.findAll({
          where: { sopId: execution.sopId, status: 'completed' }
        });
        
        const avgTime = allExecutions.reduce((sum, ex) => sum + (ex.totalDuration || 0), 0) / allExecutions.length;
        const successCount = allExecutions.filter(ex => ex.outcome === 'success').length;
        const successRate = (successCount / allExecutions.length) * 100;

        await sop.update({
          averageCompletionTime: avgTime,
          successRate
        });
      }

      logger.info(`Completed SOP execution ${id}`);

      res.json(execution);
    } catch (error) {
      logger.error('Error completing execution:', error);
      res.status(500).json({ error: 'Failed to complete execution' });
    }
  }

  /**
   * Get all executions (admin)
   */
  async getAllExecutions(req, res) {
    try {
      const organizationId = req.user.organizationId;
      const {
        sopId,
        status,
        outcome,
        page = 1,
        limit = 20
      } = req.query;

      const where = organizationId ? { organizationId } : {};

      if (sopId) where.sopId = sopId;
      if (status) where.status = status;
      if (outcome) where.outcome = outcome;

      const offset = (page - 1) * limit;

      const { rows: executions, count: total } = await SOPExecution.findAndCountAll({
        where,
        include: [
          { model: SOP, as: 'sop', attributes: ['id', 'title', 'sopNumber'] },
          { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
          { model: Zone, as: 'zone', attributes: ['id', 'name'], required: false },
          { model: Batch, as: 'batch', attributes: ['id', 'batchNumber'], required: false }
        ],
        order: [['startedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        executions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching executions:', error);
      res.status(500).json({ error: 'Failed to fetch executions' });
    }
  }

  /**
   * Get single execution by ID
   */
  async getExecutionById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const execution = await SOPExecution.findOne({
        where: {
          id,
          [Op.or]: [
            { executedBy: userId },
            ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : [])
          ]
        },
        include: [
          { model: SOP, as: 'sop', include: [{ model: SOPStep, as: 'steps' }] },
          { model: User, as: 'executor', attributes: ['id', 'firstName', 'lastName'] },
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false }
        ]
      });

      if (!execution) {
        return res.status(404).json({ error: 'Execution not found' });
      }

      res.json(execution);
    } catch (error) {
      logger.error('Error fetching execution:', error);
      res.status(500).json({ error: 'Failed to fetch execution' });
    }
  }

  /**
   * Get current user's executions
   */
  async getMyExecutions(req, res) {
    try {
      const userId = req.user.id;
      const {
        status,
        page = 1,
        limit = 20
      } = req.query;

      const where = { executedBy: userId };
      if (status) where.status = status;

      const offset = (page - 1) * limit;

      const { rows: executions, count: total } = await SOPExecution.findAndCountAll({
        where,
        include: [
          { model: SOP, as: 'sop', attributes: ['id', 'title', 'sopNumber', 'category'] },
          { model: Zone, as: 'zone', attributes: ['id', 'name'], required: false }
        ],
        order: [['startedAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        executions,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching my executions:', error);
      res.status(500).json({ error: 'Failed to fetch executions' });
    }
  }
}

module.exports = new SOPExecutionController();


/**
 * SOP (Standard Operating Procedure) Controller
 * Manages SOPs, steps, and executions
 */

const { SOP, SOPStep, SOPExecution, User, Zone, Batch, Farm } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class SOPController {
  constructor() {
    // Bind methods
    this.getAllSOPs = this.getAllSOPs.bind(this);
    this.getSOPById = this.getSOPById.bind(this);
    this.createSOP = this.createSOP.bind(this);
    this.updateSOP = this.updateSOP.bind(this);
    this.deleteSOP = this.deleteSOP.bind(this);
    this.approveSOP = this.approveSOP.bind(this);
    this.duplicateSOP = this.duplicateSOP.bind(this);
    this.getSOPStats = this.getSOPStats.bind(this);
  }

  /**
   * Get all SOPs with filtering
   */
  async getAllSOPs(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        category,
        status,
        isPublic,
        search,
        page = 1,
        limit = 20
      } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : []),
          { isPublic: true }
        ]
      };

      if (category) where.category = category;
      if (status) where.status = status;
      if (isPublic !== undefined) where.isPublic = isPublic === 'true';
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { keywords: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { rows: sops, count: total } = await SOP.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: SOPStep,
            as: 'steps',
            attributes: ['id', 'stepNumber', 'title', 'isCritical']
          }
        ],
        order: [['createdAt', 'DESC'], [{ model: SOPStep, as: 'steps' }, 'stepNumber', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        sops,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching SOPs:', error);
      res.status(500).json({ error: 'Failed to fetch SOPs' });
    }
  }

  /**
   * Get single SOP with all steps
   */
  async getSOPById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const sop = await SOP.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : []),
            { isPublic: true }
          ]
        },
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: SOPStep,
            as: 'steps',
            order: [['stepNumber', 'ASC']]
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ]
      });

      if (!sop) {
        return res.status(404).json({ error: 'SOP not found' });
      }

      res.json(sop);
    } catch (error) {
      logger.error('Error fetching SOP:', error);
      res.status(500).json({ error: 'Failed to fetch SOP' });
    }
  }

  /**
   * Create new SOP with steps
   */
  async createSOP(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { steps, ...sopData } = req.body;

      // Generate SOP number if not provided
      let sopNumber = sopData.sopNumber;
      if (!sopNumber) {
        const count = await SOP.count({ where: { ownerId: userId } });
        sopNumber = `SOP-${String(count + 1).padStart(4, '0')}`;
      }

      // Create SOP
      const sop = await SOP.create({
        ...sopData,
        sopNumber,
        ownerId: userId,
        organizationId: organizationId || null
      });

      // Create steps if provided
      if (steps && Array.isArray(steps) && steps.length > 0) {
        const stepsToCreate = steps.map((step, index) => ({
          ...step,
          sopId: sop.id,
          stepNumber: step.stepNumber || index + 1
        }));
        await SOPStep.bulkCreate(stepsToCreate);
      }

      // Fetch complete SOP with steps
      const completeSOP = await SOP.findByPk(sop.id, {
        include: [{ model: SOPStep, as: 'steps', order: [['stepNumber', 'ASC']] }]
      });

      logger.info(`Created SOP ${sop.id} with ${steps?.length || 0} steps`);

      res.status(201).json(completeSOP);
    } catch (error) {
      logger.error('Error creating SOP:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'An SOP with this number already exists'
        });
      }
      res.status(500).json({ error: 'Failed to create SOP' });
    }
  }

  /**
   * Update SOP and its steps
   */
  async updateSOP(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { steps, ...sopData } = req.body;

      const sop = await SOP.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!sop) {
        return res.status(404).json({ error: 'SOP not found' });
      }

      // If significant changes, increment version
      if (sopData.steps || sopData.title) {
        const [major, minor] = (sop.version || '1.0').split('.').map(Number);
        sopData.version = `${major}.${minor + 1}`;
        sopData.revisionNumber = (sop.revisionNumber || 0) + 1;
      }

      // Update SOP
      await sop.update(sopData);

      // Update steps if provided
      if (steps && Array.isArray(steps)) {
        // Delete existing steps
        await SOPStep.destroy({ where: { sopId: id } });
        
        // Create new steps
        if (steps.length > 0) {
          const stepsToCreate = steps.map((step, index) => ({
            ...step,
            sopId: id,
            stepNumber: step.stepNumber || index + 1
          }));
          await SOPStep.bulkCreate(stepsToCreate);
        }
      }

      // Fetch updated SOP with steps
      const updatedSOP = await SOP.findByPk(id, {
        include: [{ model: SOPStep, as: 'steps', order: [['stepNumber', 'ASC']] }]
      });

      logger.info(`Updated SOP ${id}`);

      res.json(updatedSOP);
    } catch (error) {
      logger.error('Error updating SOP:', error);
      res.status(500).json({ error: 'Failed to update SOP' });
    }
  }

  /**
   * Delete SOP
   */
  async deleteSOP(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const sop = await SOP.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!sop) {
        return res.status(404).json({ error: 'SOP not found' });
      }

      // Archive instead of delete if it's been executed
      if (sop.executionCount > 0) {
        await sop.update({ status: 'archived' });
        logger.info(`Archived SOP ${id}`);
        return res.json({ message: 'SOP archived successfully' });
      }

      await sop.destroy();
      logger.info(`Deleted SOP ${id}`);

      res.json({ message: 'SOP deleted successfully' });
    } catch (error) {
      logger.error('Error deleting SOP:', error);
      res.status(500).json({ error: 'Failed to delete SOP' });
    }
  }

  /**
   * Approve SOP
   */
  async approveSOP(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const sop = await SOP.findByPk(id);

      if (!sop) {
        return res.status(404).json({ error: 'SOP not found' });
      }

      await sop.update({
        status: 'active',
        approvedBy: userId,
        approvedAt: new Date(),
        effectiveDate: new Date()
      });

      logger.info(`SOP ${id} approved by user ${userId}`);

      res.json(sop);
    } catch (error) {
      logger.error('Error approving SOP:', error);
      res.status(500).json({ error: 'Failed to approve SOP' });
    }
  }

  /**
   * Duplicate SOP
   */
  async duplicateSOP(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const original = await SOP.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : []),
            { isPublic: true }
          ]
        },
        include: [{ model: SOPStep, as: 'steps' }]
      });

      if (!original) {
        return res.status(404).json({ error: 'SOP not found' });
      }

      // Create duplicate SOP
      const duplicate = await SOP.create({
        ...original.toJSON(),
        id: undefined,
        sopNumber: undefined, // Will be auto-generated
        title: `${original.title} (Copy)`,
        status: 'draft',
        ownerId: userId,
        organizationId: organizationId || null,
        approvedBy: null,
        approvedAt: null,
        executionCount: 0,
        lastExecutedAt: null,
        createdAt: undefined,
        updatedAt: undefined
      });

      // Duplicate steps
      if (original.steps && original.steps.length > 0) {
        const stepsToDuplicate = original.steps.map(step => ({
          ...step.toJSON(),
          id: undefined,
          sopId: duplicate.id,
          createdAt: undefined,
          updatedAt: undefined
        }));
        await SOPStep.bulkCreate(stepsToDuplicate);
      }

      // Fetch complete duplicate
      const completeDuplicate = await SOP.findByPk(duplicate.id, {
        include: [{ model: SOPStep, as: 'steps', order: [['stepNumber', 'ASC']] }]
      });

      logger.info(`Duplicated SOP ${id} to ${duplicate.id}`);

      res.status(201).json(completeDuplicate);
    } catch (error) {
      logger.error('Error duplicating SOP:', error);
      res.status(500).json({ error: 'Failed to duplicate SOP' });
    }
  }

  /**
   * Get SOP statistics
   */
  async getSOPStats(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      const totalSOPs = await SOP.count({ where });
      const activeSOPs = await SOP.count({ where: { ...where, status: 'active' } });
      const draftSOPs = await SOP.count({ where: { ...where, status: 'draft' } });

      const totalExecutions = await SOPExecution.count({
        where: { executedBy: userId }
      });

      const completedExecutions = await SOPExecution.count({
        where: { executedBy: userId, status: 'completed' }
      });

      const byCategory = await SOP.findAll({
        where,
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['category']
      });

      res.json({
        totalSOPs,
        activeSOPs,
        draftSOPs,
        totalExecutions,
        completedExecutions,
        byCategory: byCategory.map(item => ({
          category: item.category,
          count: parseInt(item.dataValues.count)
        }))
      });
    } catch (error) {
      logger.error('Error fetching SOP stats:', error);
      res.status(500).json({ error: 'Failed to fetch SOP statistics' });
    }
  }
}

module.exports = new SOPController();


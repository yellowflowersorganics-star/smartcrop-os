/**
 * Quality Standards Controller
 * Manages quality criteria, grading systems, and compliance standards
 */

const { QualityStandard, User, Organization } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class QualityStandardController {
  constructor() {
    // Bind methods
    this.getAllStandards = this.getAllStandards.bind(this);
    this.getStandardById = this.getStandardById.bind(this);
    this.createStandard = this.createStandard.bind(this);
    this.updateStandard = this.updateStandard.bind(this);
    this.deleteStandard = this.deleteStandard.bind(this);
    this.approveStandard = this.approveStandard.bind(this);
    this.getActiveStandards = this.getActiveStandards.bind(this);
    this.duplicateStandard = this.duplicateStandard.bind(this);
  }

  /**
   * Get all quality standards with filtering
   */
  async getAllStandards(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        standardType,
        category,
        status,
        cropType,
        isMandatory,
        page = 1,
        limit = 50
      } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : []),
          { isPublic: true }
        ]
      };

      if (standardType) where.standardType = standardType;
      if (category) where.category = category;
      if (status) where.status = status;
      if (cropType) where.cropType = cropType;
      if (isMandatory !== undefined) where.isMandatory = isMandatory === 'true';

      const offset = (page - 1) * limit;

      const { rows: standards, count: total } = await QualityStandard.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'owner',
            attributes: ['id', 'firstName', 'lastName', 'email']
          },
          {
            model: User,
            as: 'approver',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        standards,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching quality standards:', error);
      res.status(500).json({ error: 'Failed to fetch quality standards' });
    }
  }

  /**
   * Get single quality standard by ID
   */
  async getStandardById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const standard = await QualityStandard.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : []),
            { isPublic: true }
          ]
        },
        include: [
          { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: User, as: 'approver', attributes: ['id', 'firstName', 'lastName'], required: false }
        ]
      });

      if (!standard) {
        return res.status(404).json({ error: 'Quality standard not found' });
      }

      res.json(standard);
    } catch (error) {
      logger.error('Error fetching quality standard:', error);
      res.status(500).json({ error: 'Failed to fetch quality standard' });
    }
  }

  /**
   * Create new quality standard
   */
  async createStandard(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      // Generate code if not provided
      let code = req.body.code;
      if (!code) {
        const prefix = req.body.standardType?.toUpperCase() || 'STD';
        const count = await QualityStandard.count({
          where: { ownerId: userId }
        });
        code = `${prefix}-${String(count + 1).padStart(4, '0')}`;
      }

      const standard = await QualityStandard.create({
        ...req.body,
        code,
        ownerId: userId,
        organizationId: organizationId || null
      });

      logger.info(`Created quality standard ${standard.id}`);

      res.status(201).json(standard);
    } catch (error) {
      logger.error('Error creating quality standard:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          error: 'A standard with this code already exists'
        });
      }
      res.status(500).json({ error: 'Failed to create quality standard' });
    }
  }

  /**
   * Update quality standard
   */
  async updateStandard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const standard = await QualityStandard.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!standard) {
        return res.status(404).json({ error: 'Quality standard not found' });
      }

      // If making significant changes, increment revision
      if (req.body.criteria || req.body.gradingSystem) {
        const oldVersion = standard.version;
        const [major, minor] = oldVersion.split('.').map(Number);
        req.body.version = `${major}.${minor + 1}`;
        
        // Add to revision history
        const revisionHistory = standard.revisionHistory || [];
        revisionHistory.push({
          version: oldVersion,
          date: new Date(),
          changes: req.body.changeLog || 'Updated criteria or grading system'
        });
        req.body.revisionHistory = revisionHistory;
        req.body.revisionNumber = (standard.revisionNumber || 0) + 1;
      }

      await standard.update(req.body);

      logger.info(`Updated quality standard ${id}`);

      res.json(standard);
    } catch (error) {
      logger.error('Error updating quality standard:', error);
      res.status(500).json({ error: 'Failed to update quality standard' });
    }
  }

  /**
   * Delete quality standard
   */
  async deleteStandard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const standard = await QualityStandard.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!standard) {
        return res.status(404).json({ error: 'Quality standard not found' });
      }

      // Archive instead of delete if it's been used
      if (standard.complianceRate !== null || standard.lastAssessedAt) {
        await standard.update({ status: 'archived' });
        logger.info(`Archived quality standard ${id}`);
        return res.json({ message: 'Quality standard archived successfully' });
      }

      await standard.destroy();
      logger.info(`Deleted quality standard ${id}`);

      res.json({ message: 'Quality standard deleted successfully' });
    } catch (error) {
      logger.error('Error deleting quality standard:', error);
      res.status(500).json({ error: 'Failed to delete quality standard' });
    }
  }

  /**
   * Approve quality standard
   */
  async approveStandard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const standard = await QualityStandard.findByPk(id);

      if (!standard) {
        return res.status(404).json({ error: 'Quality standard not found' });
      }

      await standard.update({
        status: 'active',
        approvedBy: userId,
        approvedAt: new Date()
      });

      logger.info(`Quality standard ${id} approved by user ${userId}`);

      res.json(standard);
    } catch (error) {
      logger.error('Error approving quality standard:', error);
      res.status(500).json({ error: 'Failed to approve quality standard' });
    }
  }

  /**
   * Get active standards for a specific crop type
   */
  async getActiveStandards(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { cropType } = req.query;

      const where = {
        status: 'active',
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : []),
          { isPublic: true }
        ]
      };

      if (cropType) {
        where[Op.or] = [
          { cropType },
          { cropType: null } // Generic standards
        ];
      }

      const standards = await QualityStandard.findAll({
        where,
        order: [['isMandatory', 'DESC'], ['name', 'ASC']]
      });

      res.json(standards);
    } catch (error) {
      logger.error('Error fetching active standards:', error);
      res.status(500).json({ error: 'Failed to fetch active standards' });
    }
  }

  /**
   * Duplicate standard (for creating new version or variant)
   */
  async duplicateStandard(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const original = await QualityStandard.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : []),
            { isPublic: true }
          ]
        }
      });

      if (!original) {
        return res.status(404).json({ error: 'Quality standard not found' });
      }

      // Create duplicate
      const duplicate = await QualityStandard.create({
        ...original.toJSON(),
        id: undefined,
        code: undefined, // Will be auto-generated
        name: `${original.name} (Copy)`,
        status: 'draft',
        ownerId: userId,
        organizationId: organizationId || null,
        approvedBy: null,
        approvedAt: null,
        complianceRate: null,
        lastAssessedAt: null,
        createdAt: undefined,
        updatedAt: undefined
      });

      logger.info(`Duplicated quality standard ${id} to ${duplicate.id}`);

      res.status(201).json(duplicate);
    } catch (error) {
      logger.error('Error duplicating quality standard:', error);
      res.status(500).json({ error: 'Failed to duplicate quality standard' });
    }
  }
}

module.exports = new QualityStandardController();


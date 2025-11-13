/**
 * Quality Control Controller
 * Handles quality inspections, defect tracking, and quality metrics
 */

const { QualityCheck, Defect, QualityStandard, Zone, Batch, Harvest, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class QualityControlController {
  constructor() {
    // Bind methods
    this.getAllQualityChecks = this.getAllQualityChecks.bind(this);
    this.getQualityCheckById = this.getQualityCheckById.bind(this);
    this.createQualityCheck = this.createQualityCheck.bind(this);
    this.updateQualityCheck = this.updateQualityCheck.bind(this);
    this.deleteQualityCheck = this.deleteQualityCheck.bind(this);
    this.addDefect = this.addDefect.bind(this);
    this.updateDefect = this.updateDefect.bind(this);
    this.deleteDefect = this.deleteDefect.bind(this);
    this.getDefects = this.getDefects.bind(this);
    this.getQualityStats = this.getQualityStats.bind(this);
    this.getDefectAnalysis = this.getDefectAnalysis.bind(this);
    this.reviewQualityCheck = this.reviewQualityCheck.bind(this);
    this.getComplianceReport = this.getComplianceReport.bind(this);
  }

  /**
   * Get all quality checks with filtering
   */
  async getAllQualityChecks(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        checkType,
        overallGrade,
        passStatus,
        startDate,
        endDate,
        zoneId,
        batchId,
        status,
        page = 1,
        limit = 50
      } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (checkType) where.checkType = checkType;
      if (overallGrade) where.overallGrade = overallGrade;
      if (passStatus) where.passStatus = passStatus;
      if (zoneId) where.zoneId = zoneId;
      if (batchId) where.batchId = batchId;
      if (status) where.status = status;

      if (startDate || endDate) {
        where.checkDate = {};
        if (startDate) where.checkDate[Op.gte] = new Date(startDate);
        if (endDate) where.checkDate[Op.lte] = new Date(endDate);
      }

      const offset = (page - 1) * limit;

      const { rows: qualityChecks, count: total } = await QualityCheck.findAndCountAll({
        where,
        include: [
          {
            model: Zone,
            as: 'zone',
            attributes: ['id', 'name', 'zoneNumber'],
            required: false
          },
          {
            model: Batch,
            as: 'batch',
            attributes: ['batchNumber', 'cropName', 'status'],
            required: false
          },
          {
            model: Harvest,
            as: 'harvest',
            required: false
          },
          {
            model: Defect,
            as: 'defects',
            required: false
          },
          {
            model: User,
            as: 'reviewer',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [['checkDate', 'DESC'], ['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        qualityChecks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching quality checks:', error);
      res.status(500).json({ error: 'Failed to fetch quality checks' });
    }
  }

  /**
   * Get single quality check by ID
   */
  async getQualityCheckById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const qualityCheck = await QualityCheck.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        },
        include: [
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Harvest, as: 'harvest', required: false },
          { model: Defect, as: 'defects', required: false },
          { model: User, as: 'owner', attributes: ['id', 'firstName', 'lastName'], required: false },
          { model: User, as: 'reviewer', attributes: ['id', 'firstName', 'lastName'], required: false }
        ]
      });

      if (!qualityCheck) {
        return res.status(404).json({ error: 'Quality check not found' });
      }

      res.json(qualityCheck);
    } catch (error) {
      logger.error('Error fetching quality check:', error);
      res.status(500).json({ error: 'Failed to fetch quality check' });
    }
  }

  /**
   * Create quality check
   */
  async createQualityCheck(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const qualityCheckData = {
        ...req.body,
        ownerId: userId,
        organizationId: organizationId || null,
        inspectorName: req.body.inspectorName || `${req.user.firstName} ${req.user.lastName}`
      };

      // Calculate quality score if not provided
      const qualityCheck = await QualityCheck.create(qualityCheckData);

      if (!qualityCheck.qualityScore) {
        qualityCheck.qualityScore = qualityCheck.calculateQualityScore();
        await qualityCheck.save();
      }

      logger.info(`Created quality check ${qualityCheck.id}`);

      res.status(201).json(qualityCheck);
    } catch (error) {
      logger.error('Error creating quality check:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to create quality check' });
    }
  }

  /**
   * Update quality check
   */
  async updateQualityCheck(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const qualityCheck = await QualityCheck.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!qualityCheck) {
        return res.status(404).json({ error: 'Quality check not found' });
      }

      await qualityCheck.update(req.body);

      // Recalculate quality score if relevant fields changed
      if (req.body.defectRate !== undefined || req.body.appearance !== undefined) {
        qualityCheck.qualityScore = qualityCheck.calculateQualityScore();
        await qualityCheck.save();
      }

      logger.info(`Updated quality check ${id}`);

      res.json(qualityCheck);
    } catch (error) {
      logger.error('Error updating quality check:', error);
      res.status(500).json({ error: 'Failed to update quality check' });
    }
  }

  /**
   * Delete quality check
   */
  async deleteQualityCheck(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const qualityCheck = await QualityCheck.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!qualityCheck) {
        return res.status(404).json({ error: 'Quality check not found' });
      }

      await qualityCheck.destroy();

      logger.info(`Deleted quality check ${id}`);

      res.json({ message: 'Quality check deleted successfully' });
    } catch (error) {
      logger.error('Error deleting quality check:', error);
      res.status(500).json({ error: 'Failed to delete quality check' });
    }
  }

  /**
   * Add defect to quality check
   */
  async addDefect(req, res) {
    try {
      const { qualityCheckId } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      // Verify quality check exists and user has access
      const qualityCheck = await QualityCheck.findOne({
        where: {
          id: qualityCheckId,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!qualityCheck) {
        return res.status(404).json({ error: 'Quality check not found' });
      }

      const defect = await Defect.create({
        ...req.body,
        qualityCheckId,
        ownerId: userId,
        organizationId: organizationId || null
      });

      // Update defect count on quality check
      await qualityCheck.increment('defectCount');

      logger.info(`Added defect ${defect.id} to quality check ${qualityCheckId}`);

      res.status(201).json(defect);
    } catch (error) {
      logger.error('Error adding defect:', error);
      res.status(500).json({ error: 'Failed to add defect' });
    }
  }

  /**
   * Update defect
   */
  async updateDefect(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const defect = await Defect.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      await defect.update(req.body);

      logger.info(`Updated defect ${id}`);

      res.json(defect);
    } catch (error) {
      logger.error('Error updating defect:', error);
      res.status(500).json({ error: 'Failed to update defect' });
    }
  }

  /**
   * Delete defect
   */
  async deleteDefect(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const defect = await Defect.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      const qualityCheckId = defect.qualityCheckId;
      await defect.destroy();

      // Update defect count on quality check
      const qualityCheck = await QualityCheck.findByPk(qualityCheckId);
      if (qualityCheck) {
        await qualityCheck.decrement('defectCount');
      }

      logger.info(`Deleted defect ${id}`);

      res.json({ message: 'Defect deleted successfully' });
    } catch (error) {
      logger.error('Error deleting defect:', error);
      res.status(500).json({ error: 'Failed to delete defect' });
    }
  }

  /**
   * Get defects with filtering
   */
  async getDefects(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        qualityCheckId,
        defectType,
        severity,
        category,
        actionStatus,
        page = 1,
        limit = 50
      } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (qualityCheckId) where.qualityCheckId = qualityCheckId;
      if (defectType) where.defectType = defectType;
      if (severity) where.severity = severity;
      if (category) where.category = category;
      if (actionStatus) where.actionStatus = actionStatus;

      const offset = (page - 1) * limit;

      const { rows: defects, count: total } = await Defect.findAndCountAll({
        where,
        include: [
          {
            model: QualityCheck,
            as: 'qualityCheck',
            attributes: ['id', 'checkType', 'checkDate', 'overallGrade']
          },
          {
            model: User,
            as: 'responsible',
            attributes: ['id', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        defects,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching defects:', error);
      res.status(500).json({ error: 'Failed to fetch defects' });
    }
  }

  /**
   * Get quality statistics
   */
  async getQualityStats(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        where.checkDate = {};
        if (startDate) where.checkDate[Op.gte] = new Date(startDate);
        if (endDate) where.checkDate[Op.lte] = new Date(endDate);
      }

      const [
        totalChecks,
        passedChecks,
        failedChecks,
        avgQualityScore,
        gradeDistribution,
        checkTypeDistribution
      ] = await Promise.all([
        QualityCheck.count({ where }),
        QualityCheck.count({ where: { ...where, passStatus: 'pass' } }),
        QualityCheck.count({ where: { ...where, passStatus: 'fail' } }),
        QualityCheck.findOne({
          where,
          attributes: [[QualityCheck.sequelize.fn('AVG', QualityCheck.sequelize.col('qualityScore')), 'avg']]
        }),
        QualityCheck.findAll({
          where,
          attributes: [
            'overallGrade',
            [QualityCheck.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['overallGrade']
        }),
        QualityCheck.findAll({
          where,
          attributes: [
            'checkType',
            [QualityCheck.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['checkType']
        })
      ]);

      res.json({
        totalChecks,
        passedChecks,
        failedChecks,
        passRate: totalChecks > 0 ? ((passedChecks / totalChecks) * 100).toFixed(2) : 0,
        avgQualityScore: parseFloat(avgQualityScore?.get('avg') || 0).toFixed(2),
        gradeDistribution: gradeDistribution.map(item => ({
          grade: item.overallGrade,
          count: parseInt(item.get('count'))
        })),
        checkTypeDistribution: checkTypeDistribution.map(item => ({
          type: item.checkType,
          count: parseInt(item.get('count'))
        }))
      });
    } catch (error) {
      logger.error('Error fetching quality stats:', error);
      res.status(500).json({ error: 'Failed to fetch quality stats' });
    }
  }

  /**
   * Get defect analysis
   */
  async getDefectAnalysis(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const qualityCheckWhere = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        qualityCheckWhere.checkDate = {};
        if (startDate) qualityCheckWhere.checkDate[Op.gte] = new Date(startDate);
        if (endDate) qualityCheckWhere.checkDate[Op.lte] = new Date(endDate);
      }

      // Get quality check IDs in date range
      const qualityChecks = await QualityCheck.findAll({
        where: qualityCheckWhere,
        attributes: ['id']
      });

      const qualityCheckIds = qualityChecks.map(qc => qc.id);

      if (qualityCheckIds.length === 0) {
        return res.json({
          totalDefects: 0,
          criticalDefects: 0,
          resolvedDefects: 0,
          defectsByType: [],
          defectsBySeverity: [],
          defectsByCategory: []
        });
      }

      const defectWhere = {
        qualityCheckId: { [Op.in]: qualityCheckIds }
      };

      const [
        totalDefects,
        criticalDefects,
        resolvedDefects,
        defectsByType,
        defectsBySeverity,
        defectsByCategory
      ] = await Promise.all([
        Defect.count({ where: defectWhere }),
        Defect.count({ where: { ...defectWhere, severity: 'critical' } }),
        Defect.count({ where: { ...defectWhere, actionStatus: 'completed' } }),
        Defect.findAll({
          where: defectWhere,
          attributes: [
            'defectType',
            [Defect.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['defectType'],
          order: [[Defect.sequelize.literal('count'), 'DESC']],
          limit: 10
        }),
        Defect.findAll({
          where: defectWhere,
          attributes: [
            'severity',
            [Defect.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['severity']
        }),
        Defect.findAll({
          where: defectWhere,
          attributes: [
            'category',
            [Defect.sequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['category']
        })
      ]);

      res.json({
        totalDefects,
        criticalDefects,
        resolvedDefects,
        resolutionRate: totalDefects > 0 ? ((resolvedDefects / totalDefects) * 100).toFixed(2) : 0,
        defectsByType: defectsByType.map(item => ({
          type: item.defectType,
          count: parseInt(item.get('count'))
        })),
        defectsBySeverity: defectsBySeverity.map(item => ({
          severity: item.severity,
          count: parseInt(item.get('count'))
        })),
        defectsByCategory: defectsByCategory.map(item => ({
          category: item.category,
          count: parseInt(item.get('count'))
        }))
      });
    } catch (error) {
      logger.error('Error fetching defect analysis:', error);
      res.status(500).json({ error: 'Failed to fetch defect analysis' });
    }
  }

  /**
   * Review and approve/reject quality check
   */
  async reviewQualityCheck(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { status, reviewNotes } = req.body;

      if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Status must be "approved" or "rejected"' });
      }

      const qualityCheck = await QualityCheck.findByPk(id);

      if (!qualityCheck) {
        return res.status(404).json({ error: 'Quality check not found' });
      }

      await qualityCheck.update({
        status,
        reviewedBy: userId,
        reviewedAt: new Date(),
        reviewNotes
      });

      logger.info(`Quality check ${id} ${status} by user ${userId}`);

      res.json(qualityCheck);
    } catch (error) {
      logger.error('Error reviewing quality check:', error);
      res.status(500).json({ error: 'Failed to review quality check' });
    }
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { startDate, endDate } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (startDate || endDate) {
        where.checkDate = {};
        if (startDate) where.checkDate[Op.gte] = new Date(startDate);
        if (endDate) where.checkDate[Op.lte] = new Date(endDate);
      }

      const complianceStats = await QualityCheck.findAll({
        where,
        attributes: [
          'complianceStatus',
          [QualityCheck.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['complianceStatus']
      });

      const totalChecks = complianceStats.reduce((sum, stat) => sum + parseInt(stat.get('count')), 0);
      const compliantChecks = complianceStats.find(s => s.complianceStatus === 'compliant');
      const compliantCount = compliantChecks ? parseInt(compliantChecks.get('count')) : 0;

      res.json({
        totalChecks,
        complianceRate: totalChecks > 0 ? ((compliantCount / totalChecks) * 100).toFixed(2) : 0,
        complianceStats: complianceStats.map(item => ({
          status: item.complianceStatus,
          count: parseInt(item.get('count')),
          percentage: totalChecks > 0 ? ((parseInt(item.get('count')) / totalChecks) * 100).toFixed(2) : 0
        }))
      });
    } catch (error) {
      logger.error('Error fetching compliance report:', error);
      res.status(500).json({ error: 'Failed to fetch compliance report' });
    }
  }
}

module.exports = new QualityControlController();


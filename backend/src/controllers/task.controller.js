/**
 * Task Management Controller
 * Handles tasks, task templates, and recurring tasks
 */

const { Task, TaskTemplate, Zone, Batch, Farm, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class TaskController {
  constructor() {
    // Bind methods to maintain context
    this.getAllTasks = this.getAllTasks.bind(this);
    this.getTaskById = this.getTaskById.bind(this);
    this.createTask = this.createTask.bind(this);
    this.updateTask = this.updateTask.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
    this.completeTask = this.completeTask.bind(this);
    this.updateTaskStatus = this.updateTaskStatus.bind(this);
    this.updateChecklist = this.updateChecklist.bind(this);
    this.getTaskStats = this.getTaskStats.bind(this);
    this.getUpcomingTasks = this.getUpcomingTasks.bind(this);
    this.getOverdueTasks = this.getOverdueTasks.bind(this);
    // Template methods
    this.getAllTemplates = this.getAllTemplates.bind(this);
    this.getTemplateById = this.getTemplateById.bind(this);
    this.createTemplate = this.createTemplate.bind(this);
    this.updateTemplate = this.updateTemplate.bind(this);
    this.deleteTemplate = this.deleteTemplate.bind(this);
    this.createTaskFromTemplate = this.createTaskFromTemplate.bind(this);
    // Recurrence methods
    this.generateRecurringTasks = this.generateRecurringTasks.bind(this);
  }

  /**
   * Get all tasks with filtering
   */
  async getAllTasks(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        status,
        category,
        priority,
        assignedTo,
        zoneId,
        batchId,
        farmId,
        startDate,
        endDate,
        search,
        page = 1,
        limit = 50
      } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          { assignedTo: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (status) where.status = status;
      if (category) where.category = category;
      if (priority) where.priority = priority;
      if (assignedTo) where.assignedTo = assignedTo;
      if (zoneId) where.zoneId = zoneId;
      if (batchId) where.batchId = batchId;
      if (farmId) where.farmId = farmId;

      if (startDate || endDate) {
        where.dueDate = {};
        if (startDate) where.dueDate[Op.gte] = new Date(startDate);
        if (endDate) where.dueDate[Op.lte] = new Date(endDate);
      }

      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { rows: tasks, count: total } = await Task.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'assignee',
            attributes: ['id', 'firstName', 'lastName', 'email'],
            required: false
          },
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
            model: Farm,
            as: 'farm',
            attributes: ['id', 'name'],
            required: false
          }
        ],
        order: [
          ['dueDate', 'ASC'],
          ['priority', 'DESC'],
          ['createdAt', 'DESC']
        ],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Check for overdue tasks and update status
      await this.checkOverdueTasks(tasks);

      logger.info(`Retrieved ${tasks.length} tasks for user ${userId}`);

      res.json({
        tasks,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching tasks:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  }

  /**
   * Get single task by ID
   */
  async getTaskById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const task = await Task.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            { assignedTo: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        },
        include: [
          { model: User, as: 'assignee', required: false },
          { model: User, as: 'owner', required: false },
          { model: User, as: 'completedByUser', required: false },
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false },
          { model: Farm, as: 'farm', required: false },
          { model: TaskTemplate, as: 'template', required: false }
        ]
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.json(task);
    } catch (error) {
      logger.error('Error fetching task:', error);
      res.status(500).json({ error: 'Failed to fetch task' });
    }
  }

  /**
   * Create new task
   */
  async createTask(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const taskData = {
        ...req.body,
        ownerId: userId,
        organizationId: organizationId || null,
        assignedTo: req.body.assignedTo || userId // Default assign to creator
      };

      const task = await Task.create(taskData);

      // If recurring, generate future instances
      if (task.isRecurring) {
        await this.generateRecurringTasks(task);
      }

      logger.info(`Created task ${task.id}: ${task.title}`);

      res.status(201).json(task);
    } catch (error) {
      logger.error('Error creating task:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  /**
   * Update task
   */
  async updateTask(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const task = await Task.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await task.update(req.body);

      logger.info(`Updated task ${id}`);

      res.json(task);
    } catch (error) {
      logger.error('Error updating task:', error);
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  /**
   * Delete task
   */
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const task = await Task.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await task.destroy();

      logger.info(`Deleted task ${id}`);

      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      logger.error('Error deleting task:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }

  /**
   * Complete task
   */
  async completeTask(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { completionNotes, actualDuration } = req.body;

      const task = await Task.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            { assignedTo: userId }
          ]
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await task.update({
        status: 'completed',
        completedAt: new Date(),
        completedBy: userId,
        completionNotes,
        actualDuration: actualDuration || task.actualDuration
      });

      logger.info(`Completed task ${id}`);

      res.json(task);
    } catch (error) {
      logger.error('Error completing task:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  }

  /**
   * Update task status
   */
  async updateTaskStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const task = await Task.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            { assignedTo: userId }
          ]
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const updateData = { status };

      if (status === 'completed') {
        updateData.completedAt = new Date();
        updateData.completedBy = userId;
      }

      await task.update(updateData);

      logger.info(`Updated task ${id} status to ${status}`);

      res.json(task);
    } catch (error) {
      logger.error('Error updating task status:', error);
      res.status(500).json({ error: 'Failed to update task status' });
    }
  }

  /**
   * Update task checklist
   */
  async updateChecklist(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { checklist } = req.body;

      const task = await Task.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            { assignedTo: userId }
          ]
        }
      });

      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await task.update({ checklist });

      logger.info(`Updated checklist for task ${id}`);

      res.json(task);
    } catch (error) {
      logger.error('Error updating checklist:', error);
      res.status(500).json({ error: 'Failed to update checklist' });
    }
  }

  /**
   * Get task statistics
   */
  async getTaskStats(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          { assignedTo: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      const [total, completed, pending, inProgress, overdue] = await Promise.all([
        Task.count({ where }),
        Task.count({ where: { ...where, status: 'completed' } }),
        Task.count({ where: { ...where, status: 'pending' } }),
        Task.count({ where: { ...where, status: 'in_progress' } }),
        Task.count({
          where: {
            ...where,
            status: { [Op.in]: ['pending', 'in_progress'] },
            dueDate: { [Op.lt]: new Date() }
          }
        })
      ]);

      // Category distribution
      const categoryStats = await Task.findAll({
        where,
        attributes: [
          'category',
          [Task.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['category']
      });

      res.json({
        total,
        completed,
        pending,
        inProgress,
        overdue,
        categoryDistribution: categoryStats.reduce((acc, stat) => {
          acc[stat.category] = parseInt(stat.get('count'));
          return acc;
        }, {})
      });
    } catch (error) {
      logger.error('Error fetching task stats:', error);
      res.status(500).json({ error: 'Failed to fetch task stats' });
    }
  }

  /**
   * Get upcoming tasks
   */
  async getUpcomingTasks(req, res) {
    try {
      const userId = req.user.id;
      const { days = 7 } = req.query;

      const endDate = new Date();
      endDate.setDate(endDate.getDate() + parseInt(days));

      const tasks = await Task.findAll({
        where: {
          [Op.or]: [
            { ownerId: userId },
            { assignedTo: userId }
          ],
          status: { [Op.in]: ['pending', 'in_progress'] },
          dueDate: {
            [Op.between]: [new Date(), endDate]
          }
        },
        include: [
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false }
        ],
        order: [['dueDate', 'ASC']]
      });

      res.json(tasks);
    } catch (error) {
      logger.error('Error fetching upcoming tasks:', error);
      res.status(500).json({ error: 'Failed to fetch upcoming tasks' });
    }
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(req, res) {
    try {
      const userId = req.user.id;

      const tasks = await Task.findAll({
        where: {
          [Op.or]: [
            { ownerId: userId },
            { assignedTo: userId }
          ],
          status: { [Op.in]: ['pending', 'in_progress'] },
          dueDate: { [Op.lt]: new Date() }
        },
        include: [
          { model: Zone, as: 'zone', required: false },
          { model: Batch, as: 'batch', required: false }
        ],
        order: [['dueDate', 'ASC']]
      });

      // Update status to overdue
      for (const task of tasks) {
        if (task.status !== 'overdue') {
          await task.update({ status: 'overdue' });
        }
      }

      res.json(tasks);
    } catch (error) {
      logger.error('Error fetching overdue tasks:', error);
      res.status(500).json({ error: 'Failed to fetch overdue tasks' });
    }
  }

  /**
   * Check and update overdue tasks
   */
  async checkOverdueTasks(tasks) {
    try {
      for (const task of tasks) {
        if (task.isOverdue() && task.status !== 'overdue') {
          await task.update({ status: 'overdue' });
        }
      }
    } catch (error) {
      logger.error('Error checking overdue tasks:', error);
    }
  }

  // ==================== TEMPLATE METHODS ====================

  /**
   * Get all templates
   */
  async getAllTemplates(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { category, isPublic } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          { isPublic: true },
          ...(organizationId ? [{ organizationId }] : [])
        ],
        isActive: true
      };

      if (category) where.category = category;
      if (isPublic !== undefined) where.isPublic = isPublic === 'true';

      const templates = await TaskTemplate.findAll({
        where,
        order: [['usageCount', 'DESC'], ['name', 'ASC']]
      });

      res.json(templates);
    } catch (error) {
      logger.error('Error fetching templates:', error);
      res.status(500).json({ error: 'Failed to fetch templates' });
    }
  }

  /**
   * Get template by ID
   */
  async getTemplateById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const template = await TaskTemplate.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            { isPublic: true }
          ]
        }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      res.json(template);
    } catch (error) {
      logger.error('Error fetching template:', error);
      res.status(500).json({ error: 'Failed to fetch template' });
    }
  }

  /**
   * Create template
   */
  async createTemplate(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const template = await TaskTemplate.create({
        ...req.body,
        ownerId: userId,
        organizationId: organizationId || null
      });

      logger.info(`Created template ${template.id}: ${template.name}`);

      res.status(201).json(template);
    } catch (error) {
      logger.error('Error creating template:', error);
      res.status(500).json({ error: 'Failed to create template' });
    }
  }

  /**
   * Update template
   */
  async updateTemplate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const template = await TaskTemplate.findOne({
        where: { id, ownerId: userId }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      await template.update(req.body);

      logger.info(`Updated template ${id}`);

      res.json(template);
    } catch (error) {
      logger.error('Error updating template:', error);
      res.status(500).json({ error: 'Failed to update template' });
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const template = await TaskTemplate.findOne({
        where: { id, ownerId: userId }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      await template.update({ isActive: false });

      logger.info(`Deleted template ${id}`);

      res.json({ message: 'Template deleted successfully' });
    } catch (error) {
      logger.error('Error deleting template:', error);
      res.status(500).json({ error: 'Failed to delete template' });
    }
  }

  /**
   * Create task from template
   */
  async createTaskFromTemplate(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { dueDate, assignedTo, zoneId, batchId, farmId } = req.body;

      const template = await TaskTemplate.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            { isPublic: true }
          ]
        }
      });

      if (!template) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const task = await Task.create({
        ownerId: userId,
        organizationId: organizationId || null,
        assignedTo: assignedTo || userId,
        templateId: template.id,
        title: template.defaultTitle,
        description: template.defaultDescription,
        category: template.category,
        priority: template.defaultPriority,
        estimatedDuration: template.defaultEstimatedDuration,
        checklist: template.defaultChecklist,
        dueDate,
        zoneId,
        batchId,
        farmId,
        isRecurring: template.defaultRecurrence !== 'none',
        recurrencePattern: template.defaultRecurrence !== 'none' ? template.defaultRecurrence : null,
        recurrenceInterval: template.defaultRecurrenceInterval,
        recurrenceDays: template.defaultRecurrenceDays
      });

      // Increment usage count
      await template.increment('usageCount');

      logger.info(`Created task from template ${template.id}`);

      res.status(201).json(task);
    } catch (error) {
      logger.error('Error creating task from template:', error);
      res.status(500).json({ error: 'Failed to create task from template' });
    }
  }

  // ==================== RECURRENCE METHODS ====================

  /**
   * Generate recurring task instances
   */
  async generateRecurringTasks(parentTask) {
    try {
      if (!parentTask.isRecurring || !parentTask.recurrencePattern) {
        return;
      }

      // Generate next 30 days of recurring tasks
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      const instances = this.calculateRecurrenceInstances(
        parentTask.dueDate,
        parentTask.recurrencePattern,
        parentTask.recurrenceInterval,
        parentTask.recurrenceDays,
        parentTask.recurrenceEndDate || endDate
      );

      for (const instanceDate of instances) {
        await Task.create({
          ownerId: parentTask.ownerId,
          assignedTo: parentTask.assignedTo,
          organizationId: parentTask.organizationId,
          parentTaskId: parentTask.id,
          templateId: parentTask.templateId,
          title: parentTask.title,
          description: parentTask.description,
          category: parentTask.category,
          priority: parentTask.priority,
          estimatedDuration: parentTask.estimatedDuration,
          checklist: parentTask.checklist,
          dueDate: instanceDate,
          dueTime: parentTask.dueTime,
          zoneId: parentTask.zoneId,
          batchId: parentTask.batchId,
          farmId: parentTask.farmId,
          isRecurring: false,
          reminderEnabled: parentTask.reminderEnabled,
          reminderBefore: parentTask.reminderBefore
        });
      }

      logger.info(`Generated ${instances.length} recurring task instances`);
    } catch (error) {
      logger.error('Error generating recurring tasks:', error);
    }
  }

  /**
   * Calculate recurrence instances
   */
  calculateRecurrenceInstances(startDate, pattern, interval, days, endDate) {
    const instances = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);

    while (currentDate <= end) {
      switch (pattern) {
        case 'daily':
          currentDate.setDate(currentDate.getDate() + interval);
          if (currentDate <= end) {
            instances.push(new Date(currentDate));
          }
          break;

        case 'weekly':
          // Find next occurrence based on selected days
          for (let i = 0; i < 7 * interval; i++) {
            currentDate.setDate(currentDate.getDate() + 1);
            if (days.includes(currentDate.getDay()) && currentDate <= end) {
              instances.push(new Date(currentDate));
            }
          }
          break;

        case 'monthly':
          currentDate.setMonth(currentDate.getMonth() + interval);
          if (currentDate <= end) {
            instances.push(new Date(currentDate));
          }
          break;

        default:
          return instances;
      }

      // Safety limit: max 100 instances
      if (instances.length >= 100) break;
    }

    return instances;
  }
}

module.exports = new TaskController();


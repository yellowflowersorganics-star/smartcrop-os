/**
 * Employee Management Controller
 */

const { Employee, LaborEntry, User } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class EmployeeController {
  constructor() {
    // Bind methods
    this.getAllEmployees = this.getAllEmployees.bind(this);
    this.getEmployeeById = this.getEmployeeById.bind(this);
    this.createEmployee = this.createEmployee.bind(this);
    this.updateEmployee = this.updateEmployee.bind(this);
    this.deleteEmployee = this.deleteEmployee.bind(this);
    this.getEmployeeStats = this.getEmployeeStats.bind(this);
    this.getEmployeeLaborSummary = this.getEmployeeLaborSummary.bind(this);
    this.generateEmployeeId = this.generateEmployeeId.bind(this);
  }

  /**
   * Get all employees with filtering
   */
  async getAllEmployees(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const {
        status,
        role,
        department,
        search,
        page = 1,
        limit = 50
      } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (status) where.status = status;
      if (role) where.role = role;
      if (department) where.department = department;

      if (search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { employeeId: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { rows: employees, count: total } = await Employee.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email', 'firstName', 'lastName'],
            required: false
          }
        ],
        order: [['firstName', 'ASC'], ['lastName', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      logger.info(`Retrieved ${employees.length} employees for user ${userId}`);

      res.json({
        employees,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  }

  /**
   * Get single employee by ID
   */
  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const employee = await Employee.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        },
        include: [
          { model: User, as: 'user', required: false },
          { model: User, as: 'owner', required: false }
        ]
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      res.json(employee);
    } catch (error) {
      logger.error('Error fetching employee:', error);
      res.status(500).json({ error: 'Failed to fetch employee' });
    }
  }

  /**
   * Create new employee
   */
  async createEmployee(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      // Generate employee ID if not provided
      let employeeId = req.body.employeeId;
      if (!employeeId) {
        employeeId = await this.generateEmployeeId();
      }

      const employee = await Employee.create({
        ...req.body,
        employeeId,
        ownerId: userId,
        organizationId: organizationId || null
      });

      logger.info(`Created employee ${employee.id}: ${employee.getFullName()}`);

      res.status(201).json(employee);
    } catch (error) {
      logger.error('Error creating employee:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }
      res.status(500).json({ error: 'Failed to create employee' });
    }
  }

  /**
   * Update employee
   */
  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const employee = await Employee.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      await employee.update(req.body);

      logger.info(`Updated employee ${id}`);

      res.json(employee);
    } catch (error) {
      logger.error('Error updating employee:', error);
      res.status(500).json({ error: 'Failed to update employee' });
    }
  }

  /**
   * Delete employee (soft delete by setting status to inactive)
   */
  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const employee = await Employee.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Soft delete: set status to terminated
      await employee.update({
        status: 'terminated',
        terminationDate: new Date(),
        isActive: false
      });

      logger.info(`Deleted (soft) employee ${id}`);

      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      logger.error('Error deleting employee:', error);
      res.status(500).json({ error: 'Failed to delete employee' });
    }
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStats(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      const [total, active, inactive, onLeave] = await Promise.all([
        Employee.count({ where }),
        Employee.count({ where: { ...where, status: 'active' } }),
        Employee.count({ where: { ...where, status: 'terminated' } }),
        Employee.count({ where: { ...where, status: 'on_leave' } })
      ]);

      // Role distribution
      const roleStats = await Employee.findAll({
        where: { ...where, status: 'active' },
        attributes: [
          'role',
          [Employee.sequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['role']
      });

      res.json({
        total,
        active,
        inactive,
        onLeave,
        roleDistribution: roleStats.reduce((acc, stat) => {
          acc[stat.role] = parseInt(stat.get('count'));
          return acc;
        }, {})
      });
    } catch (error) {
      logger.error('Error fetching employee stats:', error);
      res.status(500).json({ error: 'Failed to fetch employee stats' });
    }
  }

  /**
   * Get employee labor summary
   */
  async getEmployeeLaborSummary(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { startDate, endDate } = req.query;

      const employee = await Employee.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(req.user.organizationId ? [{ organizationId: req.user.organizationId }] : [])
          ]
        }
      });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const whereConditions = { employeeId: id };
      if (startDate && endDate) {
        whereConditions.date = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      const laborEntries = await LaborEntry.findAll({
        where: whereConditions,
        attributes: [
          [LaborEntry.sequelize.fn('SUM', LaborEntry.sequelize.col('hoursWorked')), 'totalHours'],
          [LaborEntry.sequelize.fn('SUM', LaborEntry.sequelize.col('totalCost')), 'totalCost'],
          [LaborEntry.sequelize.fn('COUNT', '*'), 'entries']
        ],
        raw: true
      });

      const summary = laborEntries[0] || {
        totalHours: 0,
        totalCost: 0,
        entries: 0
      };

      res.json({
        employee: {
          id: employee.id,
          name: employee.getFullName(),
          employeeId: employee.employeeId,
          role: employee.role
        },
        summary: {
          totalHours: parseFloat(summary.totalHours) || 0,
          totalCost: parseFloat(summary.totalCost) || 0,
          totalEntries: parseInt(summary.entries) || 0
        },
        period: { startDate, endDate }
      });
    } catch (error) {
      logger.error('Error fetching employee labor summary:', error);
      res.status(500).json({ error: 'Failed to fetch labor summary' });
    }
  }

  /**
   * Generate unique employee ID
   */
  async generateEmployeeId() {
    const prefix = 'EMP';
    const year = new Date().getFullYear().toString().slice(-2);
    
    // Find the highest employee number for this year
    const lastEmployee = await Employee.findOne({
      where: {
        employeeId: {
          [Op.like]: `${prefix}${year}%`
        }
      },
      order: [['employeeId', 'DESC']]
    });

    let nextNumber = 1;
    if (lastEmployee) {
      const lastNumber = parseInt(lastEmployee.employeeId.slice(-4));
      nextNumber = lastNumber + 1;
    }

    return `${prefix}${year}${nextNumber.toString().padStart(4, '0')}`;
  }
}

module.exports = new EmployeeController();


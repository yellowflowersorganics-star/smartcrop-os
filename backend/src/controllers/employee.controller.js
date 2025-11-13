const { Employee, Role, Department, User, Task, WorkLog } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class EmployeeController {
  constructor() {
    // Bind methods to preserve 'this' context
    this.createEmployee = this.createEmployee.bind(this);
    this.getAllEmployees = this.getAllEmployees.bind(this);
    this.getEmployeeById = this.getEmployeeById.bind(this);
    this.updateEmployee = this.updateEmployee.bind(this);
    this.deleteEmployee = this.deleteEmployee.bind(this);
    this.getEmployeeStats = this.getEmployeeStats.bind(this);
    this.getEmployeeTasks = this.getEmployeeTasks.bind(this);
    this.getEmployeeWorkLogs = this.getEmployeeWorkLogs.bind(this);
    this.generateEmployeeId = this.generateEmployeeId.bind(this);
    this.linkUserAccount = this.linkUserAccount.bind(this);
    this.updateStatus = this.updateStatus.bind(this);
  }

  // Generate unique employee ID
  async generateEmployeeId(req, res) {
    try {
      const { ownerId } = req.user;
      
      // Count existing employees
      const count = await Employee.count({ where: { ownerId } });
      const nextNumber = count + 1;
      const employeeId = `EMP-${String(nextNumber).padStart(4, '0')}`;
      
      res.json({ employeeId });
    } catch (error) {
      logger.error('Error generating employee ID:', error);
      res.status(500).json({ error: 'Failed to generate employee ID' });
    }
  }

  // Create new employee
  async createEmployee(req, res) {
    try {
      const { id: ownerId, organizationId } = req.user;
      const employeeData = {
        ...req.body,
        ownerId,
        organizationId
      };

      // Check if employeeId already exists
      const existing = await Employee.findOne({
        where: { employeeId: employeeData.employeeId }
      });

      if (existing) {
        return res.status(400).json({ error: 'Employee ID already exists' });
      }

      // Validate role exists
      if (employeeData.roleId) {
        const role = await Role.findByPk(employeeData.roleId);
        if (!role) {
          return res.status(400).json({ error: 'Invalid role ID' });
        }
      }

      // Validate department exists
      if (employeeData.departmentId) {
        const department = await Department.findByPk(employeeData.departmentId);
        if (!department) {
          return res.status(400).json({ error: 'Invalid department ID' });
        }
      }

      const employee = await Employee.create(employeeData);

      // Fetch complete employee with associations
      const completeEmployee = await Employee.findByPk(employee.id, {
        include: [
          { model: Role, as: 'role' },
          { model: Department, as: 'department' }
        ]
      });

      logger.info(`Employee created: ${employee.employeeId} by user ${ownerId}`);
      res.status(201).json(completeEmployee);
    } catch (error) {
      logger.error('Error creating employee:', error);
      res.status(500).json({ error: 'Failed to create employee', details: error.message });
    }
  }

  // Get all employees
  async getAllEmployees(req, res) {
    try {
      const { id: ownerId, organizationId } = req.user;
      const { 
        status, 
        roleId, 
        departmentId, 
        search,
        page = 1,
        limit = 50
      } = req.query;

      const where = organizationId 
        ? { organizationId }
        : { ownerId };

      // Filter by status
      if (status) {
        where.status = status;
      }

      // Filter by role
      if (roleId) {
        where.roleId = roleId;
      }

      // Filter by department
      if (departmentId) {
        where.departmentId = departmentId;
      }

      // Search by name, email, phone, employeeId
      if (search) {
        where[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { employeeId: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows: employees } = await Employee.findAndCountAll({
        where,
        include: [
          { model: Role, as: 'role' },
          { model: Department, as: 'department' }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        employees,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching employees:', error);
      res.status(500).json({ error: 'Failed to fetch employees' });
    }
  }

  // Get employee by ID
  async getEmployeeById(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const employee = await Employee.findOne({
        where,
        include: [
          { model: Role, as: 'role' },
          { model: Department, as: 'department' },
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
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

  // Update employee
  async updateEmployee(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;
      const updateData = req.body;

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const employee = await Employee.findOne({ where });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Validate role if being updated
      if (updateData.roleId) {
        const role = await Role.findByPk(updateData.roleId);
        if (!role) {
          return res.status(400).json({ error: 'Invalid role ID' });
        }
      }

      // Validate department if being updated
      if (updateData.departmentId) {
        const department = await Department.findByPk(updateData.departmentId);
        if (!department) {
          return res.status(400).json({ error: 'Invalid department ID' });
        }
      }

      await employee.update(updateData);

      // Fetch updated employee with associations
      const updatedEmployee = await Employee.findByPk(employee.id, {
        include: [
          { model: Role, as: 'role' },
          { model: Department, as: 'department' }
        ]
      });

      logger.info(`Employee updated: ${employee.employeeId} by user ${ownerId}`);
      res.json(updatedEmployee);
    } catch (error) {
      logger.error('Error updating employee:', error);
      res.status(500).json({ error: 'Failed to update employee', details: error.message });
    }
  }

  // Delete employee
  async deleteEmployee(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const employee = await Employee.findOne({ where });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Check if employee has active tasks
      const activeTasks = await Task.count({
        where: {
          assignedEmployeeId: id,
          status: { [Op.in]: ['pending', 'in_progress'] }
        }
      });

      if (activeTasks > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete employee with active tasks',
          activeTasks
        });
      }

      await employee.destroy();

      logger.info(`Employee deleted: ${employee.employeeId} by user ${ownerId}`);
      res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
      logger.error('Error deleting employee:', error);
      res.status(500).json({ error: 'Failed to delete employee' });
    }
  }

  // Update employee status
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const { id: ownerId, organizationId } = req.user;

      if (!['active', 'on-leave', 'suspended', 'terminated'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const employee = await Employee.findOne({ where });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      await employee.update({ status });

      logger.info(`Employee status updated: ${employee.employeeId} to ${status}`);
      res.json(employee);
    } catch (error) {
      logger.error('Error updating employee status:', error);
      res.status(500).json({ error: 'Failed to update employee status' });
    }
  }

  // Link user account to employee
  async linkUserAccount(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.body;
      const { id: ownerId, organizationId } = req.user;

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const employee = await Employee.findOne({ where });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Validate user exists
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }

      // Check if user is already linked to another employee
      const existing = await Employee.findOne({
        where: { userId, id: { [Op.ne]: id } }
      });

      if (existing) {
        return res.status(400).json({ error: 'User already linked to another employee' });
      }

      await employee.update({ userId, canLogin: true });

      logger.info(`User account linked to employee: ${employee.employeeId}`);
      res.json(employee);
    } catch (error) {
      logger.error('Error linking user account:', error);
      res.status(500).json({ error: 'Failed to link user account' });
    }
  }

  // Get employee statistics
  async getEmployeeStats(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const employee = await Employee.findOne({ where });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      // Get task statistics
      const totalTasks = await Task.count({
        where: { assignedEmployeeId: id }
      });

      const completedTasks = await Task.count({
        where: { assignedEmployeeId: id, status: 'completed' }
      });

      const pendingTasks = await Task.count({
        where: { assignedEmployeeId: id, status: 'pending' }
      });

      const inProgressTasks = await Task.count({
        where: { assignedEmployeeId: id, status: 'in_progress' }
      });

      const overdueTasks = await Task.count({
        where: { 
          assignedEmployeeId: id, 
          status: 'overdue'
        }
      });

      // Get work log statistics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const totalHours = await WorkLog.sum('hoursWorked', {
        where: {
          employeeId: id,
          clockIn: { [Op.gte]: thirtyDaysAgo }
        }
      });

      const workDays = await WorkLog.count({
        where: {
          employeeId: id,
          clockIn: { [Op.gte]: thirtyDaysAgo }
        }
      });

      res.json({
        employee: {
          id: employee.id,
          employeeId: employee.employeeId,
          name: `${employee.firstName} ${employee.lastName}`
        },
        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
          inProgress: inProgressTasks,
          overdue: overdueTasks,
          completionRate: totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0
        },
        attendance: {
          totalHours: totalHours || 0,
          workDays: workDays,
          averageHoursPerDay: workDays > 0 ? ((totalHours || 0) / workDays).toFixed(2) : 0,
          period: 'Last 30 days'
        }
      });
    } catch (error) {
      logger.error('Error fetching employee stats:', error);
      res.status(500).json({ error: 'Failed to fetch employee statistics' });
    }
  }

  // Get employee tasks
  async getEmployeeTasks(req, res) {
    try {
      const { id } = req.params;
      const { status, priority, limit = 50 } = req.query;
      const { id: ownerId, organizationId } = req.user;

      const employeeWhere = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const employee = await Employee.findOne({ where: employeeWhere });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const taskWhere = { assignedEmployeeId: id };

      if (status) {
        taskWhere.status = status;
      }

      if (priority) {
        taskWhere.priority = priority;
      }

      const tasks = await Task.findAll({
        where: taskWhere,
        include: [
          { model: Employee, as: 'assignedEmployee' },
          { model: Role, as: 'assignedRole' }
        ],
        order: [
          ['priority', 'DESC'],
          ['dueDate', 'ASC']
        ],
        limit: parseInt(limit)
      });

      res.json({ employee, tasks });
    } catch (error) {
      logger.error('Error fetching employee tasks:', error);
      res.status(500).json({ error: 'Failed to fetch employee tasks' });
    }
  }

  // Get employee work logs
  async getEmployeeWorkLogs(req, res) {
    try {
      const { id } = req.params;
      const { startDate, endDate, limit = 50 } = req.query;
      const { id: ownerId, organizationId } = req.user;

      const employeeWhere = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const employee = await Employee.findOne({ where: employeeWhere });

      if (!employee) {
        return res.status(404).json({ error: 'Employee not found' });
      }

      const where = { employeeId: id };

      if (startDate) {
        where.clockIn = { [Op.gte]: new Date(startDate) };
      }

      if (endDate) {
        where.clockOut = { [Op.lte]: new Date(endDate) };
      }

      const workLogs = await WorkLog.findAll({
        where,
        order: [['clockIn', 'DESC']],
        limit: parseInt(limit)
      });

      res.json({ employee, workLogs });
    } catch (error) {
      logger.error('Error fetching employee work logs:', error);
      res.status(500).json({ error: 'Failed to fetch employee work logs' });
    }
  }
}

module.exports = new EmployeeController();

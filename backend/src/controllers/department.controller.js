const { Department, Employee } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class DepartmentController {
  constructor() {
    this.createDepartment = this.createDepartment.bind(this);
    this.getAllDepartments = this.getAllDepartments.bind(this);
    this.getDepartmentById = this.getDepartmentById.bind(this);
    this.updateDepartment = this.updateDepartment.bind(this);
    this.deleteDepartment = this.deleteDepartment.bind(this);
    this.getDepartmentEmployees = this.getDepartmentEmployees.bind(this);
  }

  // Create department
  async createDepartment(req, res) {
    try {
      const { id: ownerId, organizationId } = req.user;
      const departmentData = {
        ...req.body,
        ownerId,
        organizationId
      };

      const department = await Department.create(departmentData);

      logger.info(`Department created: ${department.name} by user ${ownerId}`);
      res.status(201).json(department);
    } catch (error) {
      logger.error('Error creating department:', error);
      res.status(500).json({ error: 'Failed to create department', details: error.message });
    }
  }

  // Get all departments
  async getAllDepartments(req, res) {
    try {
      const { id: ownerId, organizationId } = req.user;
      const { status } = req.query;

      const where = organizationId 
        ? { organizationId }
        : { ownerId };

      if (status) {
        where.status = status;
      }

      const departments = await Department.findAll({
        where,
        include: [
          { 
            model: Employee, 
            as: 'manager',
            attributes: ['id', 'employeeId', 'firstName', 'lastName']
          }
        ],
        order: [['name', 'ASC']]
      });

      // Get employee count for each department
      const departmentsWithCounts = await Promise.all(
        departments.map(async (dept) => {
          const employeeCount = await Employee.count({
            where: { departmentId: dept.id }
          });
          return {
            ...dept.toJSON(),
            employeeCount
          };
        })
      );

      res.json(departmentsWithCounts);
    } catch (error) {
      logger.error('Error fetching departments:', error);
      res.status(500).json({ error: 'Failed to fetch departments' });
    }
  }

  // Get department by ID
  async getDepartmentById(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const department = await Department.findOne({
        where,
        include: [
          { 
            model: Employee, 
            as: 'manager',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'email', 'phone']
          },
          { 
            model: Employee, 
            as: 'employees',
            attributes: ['id', 'employeeId', 'firstName', 'lastName', 'status']
          }
        ]
      });

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }

      res.json(department);
    } catch (error) {
      logger.error('Error fetching department:', error);
      res.status(500).json({ error: 'Failed to fetch department' });
    }
  }

  // Update department
  async updateDepartment(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;
      const updateData = req.body;

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const department = await Department.findOne({ where });

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }

      // Validate manager if being updated
      if (updateData.managerId) {
        const manager = await Employee.findByPk(updateData.managerId);
        if (!manager) {
          return res.status(400).json({ error: 'Invalid manager ID' });
        }
      }

      await department.update(updateData);

      // Fetch updated department with associations
      const updatedDepartment = await Department.findByPk(department.id, {
        include: [
          { 
            model: Employee, 
            as: 'manager',
            attributes: ['id', 'employeeId', 'firstName', 'lastName']
          }
        ]
      });

      logger.info(`Department updated: ${department.name} by user ${ownerId}`);
      res.json(updatedDepartment);
    } catch (error) {
      logger.error('Error updating department:', error);
      res.status(500).json({ error: 'Failed to update department', details: error.message });
    }
  }

  // Delete department
  async deleteDepartment(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;

      const where = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const department = await Department.findOne({ where });

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }

      // Check if department has employees
      const employeeCount = await Employee.count({
        where: { departmentId: id }
      });

      if (employeeCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete department with assigned employees',
          employeeCount
        });
      }

      await department.destroy();

      logger.info(`Department deleted: ${department.name} by user ${ownerId}`);
      res.json({ message: 'Department deleted successfully' });
    } catch (error) {
      logger.error('Error deleting department:', error);
      res.status(500).json({ error: 'Failed to delete department' });
    }
  }

  // Get department employees
  async getDepartmentEmployees(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;
      const { status } = req.query;

      const departmentWhere = organizationId 
        ? { id, organizationId }
        : { id, ownerId };

      const department = await Department.findOne({ where: departmentWhere });

      if (!department) {
        return res.status(404).json({ error: 'Department not found' });
      }

      const employeeWhere = { departmentId: id };

      if (status) {
        employeeWhere.status = status;
      }

      const employees = await Employee.findAll({
        where: employeeWhere,
        include: [
          { model: Role, as: 'role', attributes: ['id', 'name', 'code'] }
        ],
        order: [['firstName', 'ASC']]
      });

      res.json({ department, employees });
    } catch (error) {
      logger.error('Error fetching department employees:', error);
      res.status(500).json({ error: 'Failed to fetch department employees' });
    }
  }
}

const { Role } = require('../models');

module.exports = new DepartmentController();


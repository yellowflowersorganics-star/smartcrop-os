const { Role, Employee } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class RoleController {
  constructor() {
    this.createRole = this.createRole.bind(this);
    this.getAllRoles = this.getAllRoles.bind(this);
    this.getRoleById = this.getRoleById.bind(this);
    this.updateRole = this.updateRole.bind(this);
    this.deleteRole = this.deleteRole.bind(this);
    this.getSystemRoles = this.getSystemRoles.bind(this);
    this.seedSystemRoles = this.seedSystemRoles.bind(this);
  }

  // Seed predefined system roles
  async seedSystemRoles(req, res) {
    try {
      const systemRoles = [
        {
          name: 'Farm Manager',
          code: 'FARM_MANAGER',
          description: 'Full access to farm operations, oversees all activities, manages team',
          level: 10,
          isSystemRole: true,
          permissions: {
            farms: { view: true, create: true, edit: true, delete: true },
            zones: { view: true, create: true, edit: true, delete: true },
            employees: { view: true, create: true, edit: true, delete: true },
            inventory: { view: true, create: true, edit: true, delete: true },
            tasks: { view: true, create: true, edit: true, delete: true, assign: true },
            reports: { view: true, export: true },
            settings: { view: true, edit: true }
          }
        },
        {
          name: 'Procurement Officer',
          code: 'PROCUREMENT_OFFICER',
          description: 'Manages inventory purchases, supplier relationships, and procurement tasks',
          level: 7,
          isSystemRole: true,
          permissions: {
            inventory: { view: true, create: true, edit: true, delete: false },
            suppliers: { view: true, create: true, edit: true },
            tasks: { view: true, create: false, edit: true, delete: false },
            reports: { view: true, export: false }
          }
        },
        {
          name: 'Substrate Specialist',
          code: 'SUBSTRATE_SPECIALIST',
          description: 'Handles substrate preparation, bag filling, and quality checks',
          level: 5,
          isSystemRole: true,
          permissions: {
            zones: { view: true, create: false, edit: true, delete: false },
            batches: { view: true, create: true, edit: true },
            tasks: { view: true, create: false, edit: true, delete: false },
            quality: { view: true, create: true, edit: false }
          }
        },
        {
          name: 'Harvester',
          code: 'HARVESTER',
          description: 'Records harvest data, performs quality inspection, handles harvesting tasks',
          level: 5,
          isSystemRole: true,
          permissions: {
            zones: { view: true, create: false, edit: false, delete: false },
            harvests: { view: true, create: true, edit: true, delete: false },
            quality: { view: true, create: true, edit: false },
            tasks: { view: true, create: false, edit: true, delete: false }
          }
        },
        {
          name: 'Packaging Staff',
          code: 'PACKAGING_STAFF',
          description: 'Handles packaging, labeling, storage, and inventory updates',
          level: 4,
          isSystemRole: true,
          permissions: {
            harvests: { view: true, create: false, edit: false, delete: false },
            inventory: { view: true, create: true, edit: true, delete: false },
            tasks: { view: true, create: false, edit: true, delete: false }
          }
        },
        {
          name: 'Sales Manager',
          code: 'SALES_MANAGER',
          description: 'Manages customer orders, deliveries, payments, and sales operations',
          level: 7,
          isSystemRole: true,
          permissions: {
            customers: { view: true, create: true, edit: true, delete: false },
            orders: { view: true, create: true, edit: true, delete: false },
            revenue: { view: true, create: true, edit: true, delete: false },
            inventory: { view: true, create: false, edit: false, delete: false },
            reports: { view: true, export: true },
            tasks: { view: true, create: false, edit: true, delete: false }
          }
        },
        {
          name: 'Quality Inspector',
          code: 'QUALITY_INSPECTOR',
          description: 'Performs quality checks, compliance audits, and defect tracking',
          level: 6,
          isSystemRole: true,
          permissions: {
            quality: { view: true, create: true, edit: true, delete: false },
            zones: { view: true, create: false, edit: false, delete: false },
            harvests: { view: true, create: false, edit: false, delete: false },
            reports: { view: true, export: true },
            tasks: { view: true, create: false, edit: true, delete: false }
          }
        },
        {
          name: 'Maintenance Staff',
          code: 'MAINTENANCE_STAFF',
          description: 'Handles equipment maintenance, repairs, and facility upkeep',
          level: 4,
          isSystemRole: true,
          permissions: {
            zones: { view: true, create: false, edit: true, delete: false },
            devices: { view: true, create: false, edit: true, delete: false },
            tasks: { view: true, create: false, edit: true, delete: false }
          }
        }
      ];

      const createdRoles = [];

      for (const roleData of systemRoles) {
        const [role, created] = await Role.findOrCreate({
          where: { code: roleData.code },
          defaults: roleData
        });

        if (created) {
          createdRoles.push(role);
        }
      }

      logger.info(`Seeded ${createdRoles.length} system roles`);
      res.json({ 
        message: `Seeded ${createdRoles.length} system roles`,
        roles: createdRoles
      });
    } catch (error) {
      logger.error('Error seeding system roles:', error);
      res.status(500).json({ error: 'Failed to seed system roles' });
    }
  }

  // Create custom role
  async createRole(req, res) {
    try {
      const { id: ownerId, organizationId } = req.user;
      const roleData = {
        ...req.body,
        ownerId,
        organizationId,
        isSystemRole: false
      };

      // Check if code already exists
      const existing = await Role.findOne({
        where: { code: roleData.code }
      });

      if (existing) {
        return res.status(400).json({ error: 'Role code already exists' });
      }

      const role = await Role.create(roleData);

      logger.info(`Custom role created: ${role.code} by user ${ownerId}`);
      res.status(201).json(role);
    } catch (error) {
      logger.error('Error creating role:', error);
      res.status(500).json({ error: 'Failed to create role', details: error.message });
    }
  }

  // Get all roles
  async getAllRoles(req, res) {
    try {
      const { id: ownerId, organizationId } = req.user;
      const { includeSystem = true } = req.query;

      const where = {};

      if (includeSystem === 'true' || includeSystem === true) {
        // Include both system roles and user's custom roles
        where[Op.or] = [
          { isSystemRole: true },
          organizationId ? { organizationId } : { ownerId }
        ];
      } else {
        // Only user's custom roles
        if (organizationId) {
          where.organizationId = organizationId;
        } else {
          where.ownerId = ownerId;
        }
        where.isSystemRole = false;
      }

      const roles = await Role.findAll({
        where,
        order: [['level', 'DESC'], ['name', 'ASC']]
      });

      // Get employee count for each role
      const rolesWithCounts = await Promise.all(
        roles.map(async (role) => {
          const employeeCount = await Employee.count({
            where: { roleId: role.id }
          });
          return {
            ...role.toJSON(),
            employeeCount
          };
        })
      );

      res.json(rolesWithCounts);
    } catch (error) {
      logger.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  }

  // Get system roles only
  async getSystemRoles(req, res) {
    try {
      const roles = await Role.findAll({
        where: { isSystemRole: true },
        order: [['level', 'DESC'], ['name', 'ASC']]
      });

      res.json(roles);
    } catch (error) {
      logger.error('Error fetching system roles:', error);
      res.status(500).json({ error: 'Failed to fetch system roles' });
    }
  }

  // Get role by ID
  async getRoleById(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;

      const role = await Role.findByPk(id);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Check access: system roles are accessible to all, custom roles only to owner
      if (!role.isSystemRole) {
        const hasAccess = organizationId 
          ? role.organizationId === organizationId
          : role.ownerId === ownerId;

        if (!hasAccess) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      // Get employees with this role
      const employees = await Employee.findAll({
        where: { roleId: id },
        attributes: ['id', 'employeeId', 'firstName', 'lastName', 'status']
      });

      res.json({ ...role.toJSON(), employees });
    } catch (error) {
      logger.error('Error fetching role:', error);
      res.status(500).json({ error: 'Failed to fetch role' });
    }
  }

  // Update role
  async updateRole(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;
      const updateData = req.body;

      const role = await Role.findByPk(id);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Cannot update system roles
      if (role.isSystemRole) {
        return res.status(403).json({ error: 'Cannot update system roles' });
      }

      // Check ownership
      const hasAccess = organizationId 
        ? role.organizationId === organizationId
        : role.ownerId === ownerId;

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      await role.update(updateData);

      logger.info(`Role updated: ${role.code} by user ${ownerId}`);
      res.json(role);
    } catch (error) {
      logger.error('Error updating role:', error);
      res.status(500).json({ error: 'Failed to update role', details: error.message });
    }
  }

  // Delete role
  async deleteRole(req, res) {
    try {
      const { id } = req.params;
      const { id: ownerId, organizationId } = req.user;

      const role = await Role.findByPk(id);

      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }

      // Cannot delete system roles
      if (role.isSystemRole) {
        return res.status(403).json({ error: 'Cannot delete system roles' });
      }

      // Check ownership
      const hasAccess = organizationId 
        ? role.organizationId === organizationId
        : role.ownerId === ownerId;

      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }

      // Check if any employees have this role
      const employeeCount = await Employee.count({
        where: { roleId: id }
      });

      if (employeeCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete role with assigned employees',
          employeeCount
        });
      }

      await role.destroy();

      logger.info(`Role deleted: ${role.code} by user ${ownerId}`);
      res.json({ message: 'Role deleted successfully' });
    } catch (error) {
      logger.error('Error deleting role:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }
}

module.exports = new RoleController();


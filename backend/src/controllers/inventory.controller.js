/**
 * Inventory Management Controller
 * Handles inventory items, stock adjustments, and transactions
 */

const { InventoryItem, InventoryTransaction, Batch, Zone } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

class InventoryController {
  constructor() {
    // Bind methods to maintain context
    this.getAllItems = this.getAllItems.bind(this);
    this.getItemById = this.getItemById.bind(this);
    this.createItem = this.createItem.bind(this);
    this.updateItem = this.updateItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.adjustStock = this.adjustStock.bind(this);
    this.getTransactions = this.getTransactions.bind(this);
    this.getLowStockItems = this.getLowStockItems.bind(this);
    this.getInventoryStats = this.getInventoryStats.bind(this);
    this.recordUsage = this.recordUsage.bind(this);
  }

  /**
   * Get all inventory items with filtering and search
   */
  async getAllItems(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { 
        category, 
        isActive, 
        lowStock,
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

      // Filter by category
      if (category) {
        where.category = category;
      }

      // Filter by active status
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      // Search by name, SKU, or supplier
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { sku: { [Op.like]: `%${search}%` } },
          { supplier: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { rows: items, count: total } = await InventoryItem.findAndCountAll({
        where,
        include: [{
          model: InventoryTransaction,
          as: 'transactions',
          limit: 5,
          order: [['createdAt', 'DESC']],
          required: false
        }],
        order: [['name', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      // Filter low stock items if requested
      let filteredItems = items;
      if (lowStock === 'true') {
        filteredItems = items.filter(item => item.isLowStock());
      }

      logger.info(`Retrieved ${filteredItems.length} inventory items for user ${userId}`);

      res.json({
        items: filteredItems,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
  }

  /**
   * Get single inventory item by ID
   */
  async getItemById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const item = await InventoryItem.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        },
        include: [{
          model: InventoryTransaction,
          as: 'transactions',
          include: [
            { model: Batch, as: 'batch', attributes: ['batchNumber', 'status'] },
            { model: Zone, as: 'zone', attributes: ['id', 'name', 'zoneNumber'] }
          ],
          order: [['createdAt', 'DESC']],
          limit: 50
        }]
      });

      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      res.json(item);
    } catch (error) {
      logger.error('Error fetching inventory item:', error);
      res.status(500).json({ error: 'Failed to fetch inventory item' });
    }
  }

  /**
   * Create new inventory item
   */
  async createItem(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const itemData = {
        ...req.body,
        ownerId: userId,
        organizationId: organizationId || null
      };

      const item = await InventoryItem.create(itemData);

      logger.info(`Created inventory item ${item.id}: ${item.name}`);

      res.status(201).json(item);
    } catch (error) {
      logger.error('Error creating inventory item:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to create inventory item' });
    }
  }

  /**
   * Update inventory item
   */
  async updateItem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const item = await InventoryItem.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      // Don't allow updating stock directly - use adjustStock endpoint
      const { currentStock, totalValue, ...updateData } = req.body;

      await item.update(updateData);

      logger.info(`Updated inventory item ${id}`);

      res.json(item);
    } catch (error) {
      logger.error('Error updating inventory item:', error);
      if (error.name === 'SequelizeValidationError') {
        return res.status(400).json({ 
          error: 'Validation error',
          details: error.errors.map(e => ({ field: e.path, message: e.message }))
        });
      }
      res.status(500).json({ error: 'Failed to update inventory item' });
    }
  }

  /**
   * Delete (soft delete) inventory item
   */
  async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const item = await InventoryItem.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      // Soft delete by marking as inactive
      await item.update({ isActive: false });

      logger.info(`Deleted inventory item ${id}`);

      res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
      logger.error('Error deleting inventory item:', error);
      res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  }

  /**
   * Adjust stock level (add or remove)
   */
  async adjustStock(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { quantity, type, notes, batchId, zoneId } = req.body;

      // Validate required fields
      if (!quantity || !type) {
        return res.status(400).json({ error: 'Quantity and type are required' });
      }

      const item = await InventoryItem.findOne({
        where: {
          id,
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ]
        }
      });

      if (!item) {
        return res.status(404).json({ error: 'Inventory item not found' });
      }

      // Validate quantity based on type
      const parsedQuantity = parseFloat(quantity);
      if (type === 'usage' || type === 'waste' || type === 'adjustment_remove') {
        if (parsedQuantity > 0) {
          return res.status(400).json({ 
            error: 'Quantity must be negative for removal operations' 
          });
        }
        if (item.currentStock + parsedQuantity < 0) {
          return res.status(400).json({ 
            error: 'Insufficient stock',
            available: item.currentStock,
            requested: Math.abs(parsedQuantity)
          });
        }
      }

      // Adjust stock using model method
      await item.adjustStock(parsedQuantity, type, userId, notes, batchId);

      logger.info(`Adjusted stock for item ${id}: ${parsedQuantity} (${type})`);

      // Reload with transactions
      await item.reload({
        include: [{
          model: InventoryTransaction,
          as: 'transactions',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }]
      });

      res.json(item);
    } catch (error) {
      logger.error('Error adjusting stock:', error);
      res.status(500).json({ error: 'Failed to adjust stock' });
    }
  }

  /**
   * Get transaction history for an item or all items
   */
  async getTransactions(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { itemId, type, batchId, startDate, endDate, limit = 100 } = req.query;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ]
      };

      if (itemId) {
        where.itemId = itemId;
      }

      if (type) {
        where.type = type;
      }

      if (batchId) {
        where.batchId = batchId;
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) {
          where.createdAt[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          where.createdAt[Op.lte] = new Date(endDate);
        }
      }

      const transactions = await InventoryTransaction.findAll({
        where,
        include: [
          { 
            model: InventoryItem, 
            as: 'item',
            attributes: ['id', 'name', 'sku', 'unit']
          },
          { 
            model: Batch, 
            as: 'batch',
            attributes: ['batchNumber', 'status'],
            required: false
          },
          { 
            model: Zone, 
            as: 'zone',
            attributes: ['id', 'name', 'zoneNumber'],
            required: false
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit)
      });

      res.json(transactions);
    } catch (error) {
      logger.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  }

  /**
   * Get items with low stock
   */
  async getLowStockItems(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const items = await InventoryItem.findAll({
        where: {
          [Op.or]: [
            { ownerId: userId },
            ...(organizationId ? [{ organizationId }] : [])
          ],
          isActive: true,
          minStockLevel: { [Op.not]: null }
        }
      });

      const lowStockItems = items.filter(item => item.isLowStock());

      logger.info(`Found ${lowStockItems.length} low stock items`);

      res.json(lowStockItems);
    } catch (error) {
      logger.error('Error fetching low stock items:', error);
      res.status(500).json({ error: 'Failed to fetch low stock items' });
    }
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStats(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const where = {
        [Op.or]: [
          { ownerId: userId },
          ...(organizationId ? [{ organizationId }] : [])
        ],
        isActive: true
      };

      const items = await InventoryItem.findAll({ where });

      const stats = {
        totalItems: items.length,
        totalValue: items.reduce((sum, item) => sum + parseFloat(item.totalValue || 0), 0),
        lowStockItems: items.filter(item => item.isLowStock()).length,
        categoryCounts: {},
        categoryValues: {}
      };

      // Calculate category-wise stats
      items.forEach(item => {
        const category = item.category;
        stats.categoryCounts[category] = (stats.categoryCounts[category] || 0) + 1;
        stats.categoryValues[category] = (stats.categoryValues[category] || 0) + parseFloat(item.totalValue || 0);
      });

      res.json(stats);
    } catch (error) {
      logger.error('Error fetching inventory stats:', error);
      res.status(500).json({ error: 'Failed to fetch inventory stats' });
    }
  }

  /**
   * Record inventory usage for a batch
   * Called when starting a batch or manually recording usage
   */
  async recordUsage(req, res) {
    try {
      const userId = req.user.id;
      const organizationId = req.user.organizationId;
      const { items, batchId, zoneId, notes } = req.body;

      // items should be array of { itemId, quantity, notes }
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items array is required' });
      }

      const results = [];
      const errors = [];

      for (const itemUsage of items) {
        try {
          const item = await InventoryItem.findOne({
            where: {
              id: itemUsage.itemId,
              [Op.or]: [
                { ownerId: userId },
                ...(organizationId ? [{ organizationId }] : [])
              ]
            }
          });

          if (!item) {
            errors.push({ itemId: itemUsage.itemId, error: 'Item not found' });
            continue;
          }

          const quantity = -Math.abs(parseFloat(itemUsage.quantity)); // Ensure negative

          if (item.currentStock + quantity < 0) {
            errors.push({ 
              itemId: itemUsage.itemId, 
              error: 'Insufficient stock',
              available: item.currentStock,
              requested: Math.abs(quantity)
            });
            continue;
          }

          await item.adjustStock(
            quantity, 
            'usage', 
            userId, 
            itemUsage.notes || notes || `Used in batch ${batchId}`,
            batchId
          );

          results.push({ itemId: item.id, name: item.name, quantity, success: true });

        } catch (error) {
          logger.error(`Error recording usage for item ${itemUsage.itemId}:`, error);
          errors.push({ itemId: itemUsage.itemId, error: error.message });
        }
      }

      logger.info(`Recorded usage for ${results.length} items, ${errors.length} errors`);

      res.json({ 
        success: results.length > 0,
        results, 
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      logger.error('Error recording inventory usage:', error);
      res.status(500).json({ error: 'Failed to record inventory usage' });
    }
  }
}

module.exports = new InventoryController();


const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryItem = sequelize.define('InventoryItem', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'User who owns this inventory item'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Organization for multi-tenant isolation (optional for single-tenant)'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Item name (e.g., "Oyster Mushroom Spawn", "Straw Substrate")'
    },
    category: {
      type: DataTypes.ENUM(
        'substrate',      // Growing mediums (straw, sawdust, manure, etc.)
        'spawn',          // Mushroom spawn/culture
        'consumables',    // Bags, labels, gloves, etc.
        'packaging',      // Containers, boxes for harvested mushrooms
        'chemicals',      // pH adjusters, sterilizers, nutrients
        'equipment',      // Small equipment, tools
        'other'
      ),
      allowNull: false,
      defaultValue: 'other'
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Stock Keeping Unit / Product code'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'unit',
      comment: 'Unit of measurement (kg, lb, bag, bottle, piece, etc.)'
    },
    currentStock: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Current quantity in stock'
    },
    minStockLevel: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Minimum stock level before alert'
    },
    maxStockLevel: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Maximum stock level'
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cost per unit'
    },
    totalValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Total inventory value (currentStock * unitCost)'
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Supplier name'
    },
    supplierContact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Storage location (e.g., "Warehouse A", "Cold Room 2")'
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Expiry date for perishable items'
    },
    lastRestocked: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last time stock was added'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Whether this item is actively used'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional custom fields'
    }
  }, {
    tableName: 'inventory_items',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['category'] },
      { fields: ['sku'] },
      { fields: ['isActive'] }
    ],
    hooks: {
      beforeSave: (item) => {
        // Calculate total value
        if (item.currentStock !== null && item.unitCost !== null) {
          item.totalValue = (parseFloat(item.currentStock) * parseFloat(item.unitCost)).toFixed(2);
        }
      }
    }
  });

  InventoryItem.associate = (models) => {
    InventoryItem.hasMany(models.InventoryTransaction, {
      foreignKey: 'itemId',
      as: 'transactions'
    });
  };

  // Instance method to check if stock is low
  InventoryItem.prototype.isLowStock = function() {
    if (this.minStockLevel === null || this.minStockLevel === undefined) {
      return false;
    }
    return this.currentStock <= this.minStockLevel;
  };

  // Instance method to adjust stock
  InventoryItem.prototype.adjustStock = async function(quantity, type, userId, notes, batchId = null) {
    const InventoryTransaction = sequelize.models.InventoryTransaction;
    
    // Update current stock
    const oldStock = this.currentStock;
    this.currentStock = parseFloat(this.currentStock) + parseFloat(quantity);
    
    // Update last restocked if adding stock
    if (type === 'purchase' || type === 'adjustment_add') {
      this.lastRestocked = new Date();
    }
    
    await this.save();
    
    // Create transaction record
    await InventoryTransaction.create({
      itemId: this.id,
      ownerId: userId,
      organizationId: this.organizationId,
      type,
      quantity: parseFloat(quantity),
      previousStock: parseFloat(oldStock),
      newStock: parseFloat(this.currentStock),
      unitCost: this.unitCost,
      totalCost: this.unitCost ? (parseFloat(quantity) * parseFloat(this.unitCost)).toFixed(2) : null,
      batchId,
      notes
    });
    
    return this;
  };

  return InventoryItem;
};


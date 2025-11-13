const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const InventoryTransaction = sequelize.define('InventoryTransaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'inventory_items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Inventory item this transaction belongs to'
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: 'User who performed this transaction'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: 'Organization for multi-tenant isolation (optional for single-tenant)'
    },
    type: {
      type: DataTypes.ENUM(
        'purchase',          // Stock added from supplier
        'usage',            // Stock used in production
        'waste',            // Stock lost/damaged
        'adjustment_add',   // Manual stock increase
        'adjustment_remove', // Manual stock decrease
        'transfer',         // Stock moved to another location
        'return'            // Stock returned from batch
      ),
      allowNull: false,
      comment: 'Type of transaction'
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Quantity added (positive) or removed (negative)'
    },
    previousStock: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Stock level before transaction'
    },
    newStock: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Stock level after transaction'
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cost per unit at time of transaction'
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Total cost of this transaction (quantity * unitCost)'
    },
    batchId: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'batches',
        key: 'batchNumber'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Associated batch number (if usage)'
    },
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'zones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Associated zone (if usage)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional transaction details'
    }
  }, {
    tableName: 'inventory_transactions',
    timestamps: true,
    indexes: [
      { fields: ['itemId'] },
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['type'] },
      { fields: ['batchId'] },
      { fields: ['zoneId'] },
      { fields: ['createdAt'] }
    ]
  });

  InventoryTransaction.associate = (models) => {
    InventoryTransaction.belongsTo(models.InventoryItem, {
      foreignKey: 'itemId',
      as: 'item'
    });

    InventoryTransaction.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    InventoryTransaction.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });
  };

  return InventoryTransaction;
};


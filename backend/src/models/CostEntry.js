const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CostEntry = sequelize.define('CostEntry', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'User who recorded the cost'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: 'Date of expense'
    },
    category: {
      type: DataTypes.ENUM(
        'substrate',           // Substrate materials
        'spawn',               // Mushroom spawn
        'supplements',         // Nutritional supplements
        'packaging',           // Packaging materials
        'utilities',           // Electricity, water, gas
        'equipment',           // Equipment purchase/rental
        'maintenance',         // Repairs and maintenance
        'labor',               // Labor costs (auto-generated)
        'transportation',      // Fuel, vehicle costs
        'marketing',           // Marketing and advertising
        'rent',                // Facility rent
        'insurance',           // Insurance costs
        'supplies',            // General supplies
        'testing',             // Quality testing, lab fees
        'other'
      ),
      allowNull: false,
      comment: 'Cost category'
    },
    subcategory: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Subcategory for finer classification'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Cost description'
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Cost amount in local currency'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
      comment: 'Currency code'
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: 'Quantity purchased'
    },
    unit: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Unit of measurement (kg, bags, hours, etc.)'
    },
    unitCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Cost per unit'
    },
    supplier: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Supplier/vendor name'
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Invoice or receipt number'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'cheque', 'upi', 'other'),
      allowNull: true,
      comment: 'Payment method'
    },
    paymentStatus: {
      type: DataTypes.ENUM('paid', 'pending', 'partial', 'overdue'),
      defaultValue: 'paid',
      comment: 'Payment status'
    },
    // Associations
    zoneId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'zones',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related zone'
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
      comment: 'Related batch'
    },
    farmId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'farms',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related farm'
    },
    inventoryItemId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'inventory_items',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related inventory item'
    },
    workLogId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'work_logs',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related work log (for labor costs)'
    },
    costType: {
      type: DataTypes.ENUM('direct', 'indirect', 'fixed', 'variable'),
      defaultValue: 'direct',
      comment: 'Type of cost for accounting'
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Whether this is a recurring cost'
    },
    recurrencePattern: {
      type: DataTypes.ENUM('daily', 'weekly', 'monthly', 'yearly'),
      allowNull: true,
      comment: 'Recurrence frequency'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes'
    },
    receiptUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Receipt/invoice image URLs'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Custom tags'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: 'Additional metadata'
    }
  }, {
    tableName: 'cost_entries',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['date'] },
      { fields: ['category'] },
      { fields: ['costType'] },
      { fields: ['zoneId'] },
      { fields: ['batchId'] },
      { fields: ['farmId'] },
      { fields: ['inventoryItemId'] },
      { fields: ['paymentStatus'] },
      { fields: ['date', 'category'] }
    ]
  });

  CostEntry.associate = (models) => {
    CostEntry.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    CostEntry.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    CostEntry.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    CostEntry.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    CostEntry.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });

    CostEntry.belongsTo(models.InventoryItem, {
      foreignKey: 'inventoryItemId',
      as: 'inventoryItem'
    });

    CostEntry.belongsTo(models.WorkLog, {
      foreignKey: 'workLogId',
      as: 'workLog'
    });
  };

  // Calculate unit cost before save
  CostEntry.beforeSave(async (costEntry) => {
    if (costEntry.quantity && costEntry.amount && !costEntry.unitCost) {
      costEntry.unitCost = parseFloat((costEntry.amount / costEntry.quantity).toFixed(2));
    }
  });

  return CostEntry;
};

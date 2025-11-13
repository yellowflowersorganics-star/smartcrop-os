const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Revenue = sequelize.define('Revenue', {
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
      comment: 'User who recorded the revenue'
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
      comment: 'Date of sale/revenue'
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Exact transaction timestamp'
    },
    revenueType: {
      type: DataTypes.ENUM(
        'mushroom_sale',      // Direct mushroom sales
        'spawn_sale',         // Spawn sales
        'substrate_sale',     // Substrate sales
        'consulting',         // Consulting services
        'training',           // Training services
        'other'
      ),
      defaultValue: 'mushroom_sale',
      comment: 'Type of revenue'
    },
    productName: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Product or service name'
    },
    productType: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Product type or variety (e.g., Oyster, Button)'
    },
    quantity: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'Quantity sold'
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'kg',
      comment: 'Unit of measurement'
    },
    pricePerUnit: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Price per unit'
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Total revenue amount'
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Discount amount'
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Tax amount'
    },
    finalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Final amount after discount and tax'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR',
      comment: 'Currency code'
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Customer or buyer name'
    },
    customerContact: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Customer phone or email'
    },
    customerType: {
      type: DataTypes.ENUM('retail', 'wholesale', 'restaurant', 'distributor', 'direct', 'other'),
      allowNull: true,
      comment: 'Type of customer'
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Invoice or bill number'
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'cheque', 'upi', 'other'),
      allowNull: true,
      comment: 'Payment method'
    },
    paymentStatus: {
      type: DataTypes.ENUM('paid', 'pending', 'partial', 'overdue', 'cancelled'),
      defaultValue: 'paid',
      comment: 'Payment status'
    },
    paidAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Amount already paid'
    },
    dueAmount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      comment: 'Amount still due'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Payment due date'
    },
    // Associations
    harvestId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'harvests',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Related harvest record'
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
    qualityGrade: {
      type: DataTypes.ENUM('A+', 'A', 'B', 'C', 'reject'),
      allowNull: true,
      comment: 'Quality grade of product sold'
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Delivery address'
    },
    deliveryDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Delivery date'
    },
    deliveryStatus: {
      type: DataTypes.ENUM('pending', 'in_transit', 'delivered', 'cancelled'),
      defaultValue: 'pending',
      comment: 'Delivery status'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes'
    },
    invoiceUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
      comment: 'Invoice/receipt URLs'
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
    tableName: 'revenues',
    timestamps: true,
    indexes: [
      { fields: ['ownerId'] },
      { fields: ['organizationId'] },
      { fields: ['date'] },
      { fields: ['revenueType'] },
      { fields: ['paymentStatus'] },
      { fields: ['customerType'] },
      { fields: ['harvestId'] },
      { fields: ['batchId'] },
      { fields: ['zoneId'] },
      { fields: ['farmId'] },
      { fields: ['date', 'revenueType'] }
    ]
  });

  Revenue.associate = (models) => {
    Revenue.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner'
    });

    Revenue.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });

    Revenue.belongsTo(models.Harvest, {
      foreignKey: 'harvestId',
      as: 'harvest'
    });

    Revenue.belongsTo(models.Batch, {
      foreignKey: 'batchId',
      targetKey: 'batchNumber',
      as: 'batch'
    });

    Revenue.belongsTo(models.Zone, {
      foreignKey: 'zoneId',
      as: 'zone'
    });

    Revenue.belongsTo(models.Farm, {
      foreignKey: 'farmId',
      as: 'farm'
    });
  };

  // Calculate amounts before save
  Revenue.beforeSave(async (revenue) => {
    // Calculate total amount if not provided
    if (!revenue.totalAmount && revenue.quantity && revenue.pricePerUnit) {
      revenue.totalAmount = parseFloat((revenue.quantity * revenue.pricePerUnit).toFixed(2));
    }

    // Calculate final amount
    const total = parseFloat(revenue.totalAmount || 0);
    const discount = parseFloat(revenue.discount || 0);
    const tax = parseFloat(revenue.tax || 0);
    revenue.finalAmount = parseFloat((total - discount + tax).toFixed(2));

    // Calculate due amount
    const paid = parseFloat(revenue.paidAmount || 0);
    revenue.dueAmount = parseFloat((revenue.finalAmount - paid).toFixed(2));

    // Update payment status based on amounts
    if (revenue.dueAmount <= 0) {
      revenue.paymentStatus = 'paid';
    } else if (paid > 0 && paid < revenue.finalAmount) {
      revenue.paymentStatus = 'partial';
    }
  });

  return Revenue;
};


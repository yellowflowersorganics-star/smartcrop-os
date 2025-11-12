/**
 * Yellow Flowers SmartFarm Cloud - Invoice Model
 * Billing invoices and payment records
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Invoice = sequelize.define('Invoice', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    invoiceNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      comment: 'YF-INV-202501-001'
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    subscriptionId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Amount in rupees'
    },
    tax: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: 'GST amount'
    },
    total: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Total including tax'
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'INR'
    },
    status: {
      type: DataTypes.ENUM('draft', 'pending', 'paid', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Payment gateway details
    razorpayInvoiceId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    razorpayPaymentId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    razorpayOrderId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'card, upi, netbanking, etc.'
    },
    // Line items
    items: {
      type: DataTypes.JSONB,
      defaultValue: [],
      comment: 'Array of invoice line items'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    tableName: 'invoices',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['subscriptionId'] },
      { fields: ['status'] },
      { fields: ['razorpayInvoiceId'] }
    ]
  });

  Invoice.associate = (models) => {
    Invoice.belongsTo(models.Organization, {
      foreignKey: 'organizationId',
      as: 'organization'
    });
    Invoice.belongsTo(models.Subscription, {
      foreignKey: 'subscriptionId',
      as: 'subscription'
    });
  };

  // Generate invoice number
  Invoice.generateInvoiceNumber = async () => {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    
    // Get last invoice for this month
    const lastInvoice = await Invoice.findOne({
      where: sequelize.literal(`invoice_number LIKE 'YF-INV-${year}${month}-%'`),
      order: [['createdAt', 'DESC']]
    });
    
    let sequence = 1;
    if (lastInvoice) {
      const lastSequence = parseInt(lastInvoice.invoiceNumber.split('-')[3]);
      sequence = lastSequence + 1;
    }
    
    return `YF-INV-${year}${month}-${String(sequence).padStart(3, '0')}`;
  };

  return Invoice;
};


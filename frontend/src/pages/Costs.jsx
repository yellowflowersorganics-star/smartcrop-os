import { useState, useEffect } from 'react';
import { costService } from '../services/api';
import { 
  DollarSign, Plus, Filter, Calendar, TrendingUp,
  Edit2, Trash2, Receipt, Tag, Package
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

const COST_CATEGORIES = [
  { value: 'substrate', label: '🌱 Substrate', color: 'bg-green-100 text-green-700' },
  { value: 'spawn', label: '🍄 Spawn', color: 'bg-purple-100 text-purple-700' },
  { value: 'supplements', label: '💊 Supplements', color: 'bg-blue-100 text-blue-700' },
  { value: 'packaging', label: '📦 Packaging', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'utilities', label: '⚡ Utilities', color: 'bg-orange-100 text-orange-700' },
  { value: 'equipment', label: '🔧 Equipment', color: 'bg-gray-100 text-gray-700' },
  { value: 'maintenance', label: '🛠️ Maintenance', color: 'bg-red-100 text-red-700' },
  { value: 'labor', label: '👷 Labor', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'transportation', label: '🚚 Transportation', color: 'bg-cyan-100 text-cyan-700' },
  { value: 'marketing', label: '📢 Marketing', color: 'bg-pink-100 text-pink-700' },
  { value: 'rent', label: '🏠 Rent', color: 'bg-teal-100 text-teal-700' },
  { value: 'insurance', label: '🛡️ Insurance', color: 'bg-lime-100 text-lime-700' },
  { value: 'supplies', label: '📋 Supplies', color: 'bg-amber-100 text-amber-700' },
  { value: 'testing', label: '🔬 Testing', color: 'bg-rose-100 text-rose-700' },
  { value: 'other', label: '📌 Other', color: 'bg-slate-100 text-slate-700' }
];

export default function Costs() {
  const toast = useToast();
  const [costs, setCosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, costId: null });
  const [selectedCost, setSelectedCost] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchData();
  }, [filterCategory, filterPaymentStatus, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        category: filterCategory || undefined,
        paymentStatus: filterPaymentStatus || undefined
      };

      const [costsRes, statsRes] = await Promise.all([
        costService.getAll(params),
        costService.getStats(params)
      ]);

      setCosts(costsRes.data.costs || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching costs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await costService.delete(deleteDialog.costId);
      toast.success('Cost entry deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting cost:', error);
      toast.error('Failed to delete cost entry');
    } finally {
      setDeleteDialog({ isOpen: false, costId: null });
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getCategoryInfo = (category) => {
    return COST_CATEGORIES.find(c => c.value === category) || COST_CATEGORIES[COST_CATEGORIES.length - 1];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cost Tracking</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage expenses and track spending
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Costs</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalCosts)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Direct Costs</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(stats.directCosts)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Indirect Costs</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{formatCurrency(stats.indirectCosts)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Pending Payments</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatCurrency(stats.pendingPayments)}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-400" />
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {COST_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>

          <select
            value={filterPaymentStatus}
            onChange={(e) => setFilterPaymentStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Payment Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Category Breakdown */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {stats.categoryBreakdown.map(cat => {
              const catInfo = getCategoryInfo(cat.category);
              return (
                <div key={cat.category} className="border rounded-lg p-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  <p className="text-lg font-bold text-gray-900 mt-2">{formatCurrency(cat.total)}</p>
                  <p className="text-xs text-gray-500">{cat.count} entries</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Costs List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Expenses</h2>
        </div>

        {costs.length === 0 ? (
          <div className="p-12 text-center">
            <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-600 mb-6">
              {filterCategory || filterPaymentStatus
                ? 'Try adjusting your filters'
                : 'Start tracking your expenses'}
            </p>
            {!filterCategory && !filterPaymentStatus && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Add First Expense
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y">
            {costs.map(cost => (
              <CostCard 
                key={cost.id} 
                cost={cost} 
                onEdit={() => {
                  setSelectedCost(cost);
                  setShowEditModal(true);
                }}
                onDelete={(id) => setDeleteDialog({ isOpen: true, costId: id })}
                getCategoryInfo={getCategoryInfo}
                formatCurrency={formatCurrency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modals */}
      {showCreateModal && (
        <CostModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}

      {showEditModal && selectedCost && (
        <CostModal
          cost={selectedCost}
          onClose={() => {
            setShowEditModal(false);
            setSelectedCost(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedCost(null);
            fetchData();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, costId: null })}
        onConfirm={handleDelete}
        title="Delete Cost Entry"
        message="Are you sure you want to delete this cost entry? This action cannot be undone."
        confirmText="Delete Entry"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

function CostCard({ cost, onEdit, onDelete, getCategoryInfo, formatCurrency }) {
  const catInfo = getCategoryInfo(cost.category);
  
  const paymentStatusColors = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    partial: 'bg-orange-100 text-orange-700',
    overdue: 'bg-red-100 text-red-700'
  };

  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs font-medium px-2 py-1 rounded ${catInfo.color}`}>
              {catInfo.label}
            </span>
            <span className={`text-xs font-medium px-2 py-1 rounded ${paymentStatusColors[cost.paymentStatus]}`}>
              {cost.paymentStatus}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(cost.date).toLocaleDateString('en-IN', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1">{cost.description}</h3>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1 font-bold text-gray-900 text-lg">
              <DollarSign className="w-4 h-4" />
              {formatCurrency(cost.amount)}
            </span>

            {cost.quantity && (
              <span>
                {cost.quantity} {cost.unit}
                {cost.unitCost && ` @ ${formatCurrency(cost.unitCost)}/${cost.unit}`}
              </span>
            )}

            {cost.supplier && (
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                {cost.supplier}
              </span>
            )}

            {cost.invoiceNumber && (
              <span className="flex items-center gap-1">
                <Receipt className="w-4 h-4" />
                {cost.invoiceNumber}
              </span>
            )}
          </div>

          {cost.notes && (
            <p className="text-sm text-gray-600 mt-2">{cost.notes}</p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {cost.zone && <span>Zone: {cost.zone.name}</span>}
            {cost.batch && <span>Batch: {cost.batch.batchNumber}</span>}
            {cost.costType && <span className="capitalize">Type: {cost.costType}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(cost.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function CostModal({ cost, onClose, onSuccess }) {
  const [formData, setFormData] = useState(cost || {
    date: new Date().toISOString().split('T')[0],
    category: 'other',
    description: '',
    amount: '',
    quantity: '',
    unit: '',
    supplier: '',
    invoiceNumber: '',
    paymentMethod: 'cash',
    paymentStatus: 'paid',
    costType: 'direct',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (cost) {
        await costService.update(cost.id, formData);
      } else {
        await costService.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving cost:', error);
      setError(error.response?.data?.error || 'Failed to save cost entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {cost ? 'Edit Expense' : 'Add New Expense'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date ? formData.date.split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                {COST_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Substrate purchase, Electricity bill"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="kg, bags, etc."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier
              </label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="partial">Partial</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cost Type
              </label>
              <select
                value={formData.costType}
                onChange={(e) => setFormData({ ...formData, costType: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="direct">Direct</option>
                <option value="indirect">Indirect</option>
                <option value="fixed">Fixed</option>
                <option value="variable">Variable</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Additional details..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : (cost ? 'Update Expense' : 'Add Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


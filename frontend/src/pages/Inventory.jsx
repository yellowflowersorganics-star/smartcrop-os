import { useState, useEffect } from 'react';
import { inventoryService } from '../services/api';
import { 
  Package, Plus, Search, Filter, AlertTriangle, Edit2, Trash2, 
  TrendingUp, TrendingDown, DollarSign, Box
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

const CATEGORIES = [
  { value: 'substrate', label: 'Substrate', icon: '🌾' },
  { value: 'spawn', label: 'Spawn/Culture', icon: '🍄' },
  { value: 'consumables', label: 'Consumables', icon: '🧤' },
  { value: 'packaging', label: 'Packaging', icon: '📦' },
  { value: 'chemicals', label: 'Chemicals', icon: '🧪' },
  { value: 'equipment', label: 'Equipment', icon: '🔧' },
  { value: 'other', label: 'Other', icon: '📌' }
];

export default function Inventory() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [stats, setStats] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, itemId: null });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory, showLowStock]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        fetchData();
      }
    }, 500);

    if (!searchTerm) {
      fetchData();
    }

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        category: selectedCategory || undefined,
        lowStock: showLowStock || undefined,
        search: searchTerm || undefined
      };

      const [itemsRes, statsRes] = await Promise.all([
        inventoryService.getAll(params),
        inventoryService.getStats()
      ]);

      setItems(itemsRes.data.items || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await inventoryService.delete(deleteDialog.itemId);
      toast.success('Item deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    } finally {
      setDeleteDialog({ isOpen: false, itemId: null });
    }
  };

  const getCategoryIcon = (category) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '📌';
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value || 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage your growing supplies
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Add Item
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.totalItems}
                </p>
              </div>
              <Box className="w-10 h-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(stats.totalValue)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {stats.lowStockItems}
                </p>
              </div>
              <AlertTriangle className="w-10 h-10 text-orange-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {Object.keys(stats.categoryCounts || {}).length}
                </p>
              </div>
              <Filter className="w-10 h-10 text-purple-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, SKU, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>

          {/* Low Stock Filter */}
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`px-4 py-2 rounded-lg border ${
              showLowStock
                ? 'bg-orange-100 border-orange-500 text-orange-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            Low Stock Only
          </button>
        </div>
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading inventory...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory || showLowStock
              ? 'Try adjusting your filters'
              : 'Get started by adding your first inventory item'}
          </p>
          {!searchTerm && !selectedCategory && !showLowStock && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Add First Item
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onEdit={() => {
                setSelectedItem(item);
                setShowEditModal(true);
              }}
              onDelete={() => setDeleteDialog({ isOpen: true, itemId: item.id })}
              onAdjustStock={() => {
                setSelectedItem(item);
                setShowStockModal(true);
              }}
              getCategoryIcon={getCategoryIcon}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEditItemModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchData();
          }}
        />
      )}

      {showEditModal && selectedItem && (
        <AddEditItemModal
          item={selectedItem}
          onClose={() => {
            setShowEditModal(false);
            setSelectedItem(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedItem(null);
            fetchData();
          }}
        />
      )}

      {showStockModal && selectedItem && (
        <StockAdjustmentModal
          item={selectedItem}
          onClose={() => {
            setShowStockModal(false);
            setSelectedItem(null);
          }}
          onSuccess={() => {
            setShowStockModal(false);
            setSelectedItem(null);
            fetchData();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, itemId: null })}
        onConfirm={handleDelete}
        title="Delete Inventory Item"
        message="Are you sure you want to delete this inventory item? All transaction history will be retained, but the item cannot be used for future transactions."
        confirmText="Delete Item"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

// Inventory Item Card Component
function InventoryItemCard({ item, onEdit, onDelete, onAdjustStock, getCategoryIcon, formatCurrency }) {
  const isLowStock = item.minStockLevel && item.currentStock <= item.minStockLevel;
  const stockPercentage = item.maxStockLevel 
    ? (item.currentStock / item.maxStockLevel) * 100 
    : 100;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="text-3xl">{getCategoryIcon(item.category)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
              {item.sku && (
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
              )}
              <span className="inline-block px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded mt-1">
                {CATEGORIES.find(c => c.value === item.category)?.label}
              </span>
            </div>
          </div>
          
          {isLowStock && (
            <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0" />
          )}
        </div>

        {/* Stock Info */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Current Stock:</span>
            <span className={`font-bold ${isLowStock ? 'text-orange-600' : 'text-gray-900'}`}>
              {item.currentStock} {item.unit}
            </span>
          </div>

          {item.minStockLevel && (
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600">Stock Level:</span>
                <span className="text-gray-500">
                  Min: {item.minStockLevel} {item.unit}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    isLowStock ? 'bg-orange-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                />
              </div>
            </div>
          )}

          {item.unitCost && (
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-sm text-gray-600">Total Value:</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(item.totalValue)}
              </span>
            </div>
          )}

          {item.supplier && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Supplier:</span>
              <span className="text-gray-900">{item.supplier}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onAdjustStock}
            className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-sm font-medium"
          >
            <TrendingUp className="w-4 h-4 inline mr-1" />
            Adjust Stock
          </button>
          <button
            onClick={onEdit}
            className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Item Modal Component
function AddEditItemModal({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState(item || {
    name: '',
    category: 'other',
    sku: '',
    description: '',
    unit: 'kg',
    currentStock: 0,
    minStockLevel: '',
    maxStockLevel: '',
    unitCost: '',
    supplier: '',
    supplierContact: '',
    location: '',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (item) {
        await inventoryService.update(item.id, formData);
      } else {
        await inventoryService.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving item:', error);
      setError(error.response?.data?.error || 'Failed to save item');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {item ? 'Edit Item' : 'Add New Item'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Oyster Mushroom Spawn"
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
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                SKU
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., OMS-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit *
              </label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., kg, lb, bag, bottle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {item ? 'Current Stock' : 'Initial Stock'} *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.currentStock}
                onChange={(e) => setFormData({ ...formData, currentStock: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                disabled={!!item}
              />
              {item && (
                <p className="text-xs text-gray-500 mt-1">Use "Adjust Stock" to change quantity</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Stock Level
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.minStockLevel}
                onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Stock Level
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.maxStockLevel}
                onChange={(e) => setFormData({ ...formData, maxStockLevel: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Cost (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

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
                Supplier Contact
              </label>
              <input
                type="text"
                value={formData.supplierContact}
                onChange={(e) => setFormData({ ...formData, supplierContact: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Storage Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., Warehouse A, Shelf 3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows="2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                rows="2"
              />
            </div>
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
              {saving ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Stock Adjustment Modal Component
function StockAdjustmentModal({ item, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    quantity: '',
    type: 'purchase',
    notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const transactionTypes = [
    { value: 'purchase', label: 'Purchase (Add Stock)', sign: '+' },
    { value: 'usage', label: 'Usage (Remove Stock)', sign: '-' },
    { value: 'waste', label: 'Waste/Loss (Remove Stock)', sign: '-' },
    { value: 'adjustment_add', label: 'Manual Adjustment (Add)', sign: '+' },
    { value: 'adjustment_remove', label: 'Manual Adjustment (Remove)', sign: '-' }
  ];

  const selectedType = transactionTypes.find(t => t.value === formData.type);
  const isRemoval = selectedType?.sign === '-';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      let quantity = parseFloat(formData.quantity);
      
      // Make quantity negative for removal operations
      if (isRemoval && quantity > 0) {
        quantity = -quantity;
      }

      await inventoryService.adjustStock(item.id, {
        ...formData,
        quantity
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error adjusting stock:', error);
      setError(error.response?.data?.error || 'Failed to adjust stock');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Adjust Stock</h2>
          <p className="text-sm text-gray-600 mt-1">{item.name}</p>
          <p className="text-sm font-medium text-gray-900 mt-2">
            Current Stock: {item.currentStock} {item.unit}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type *
            </label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {transactionTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity ({item.unit}) *
            </label>
            <div className="relative">
              <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 font-bold ${
                isRemoval ? 'text-red-500' : 'text-green-500'
              }`}>
                {selectedType?.sign}
              </span>
              <input
                type="number"
                step="0.01"
                required
                min="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full pl-8 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Enter quantity"
              />
            </div>
            {isRemoval && item.currentStock && (
              <p className="text-xs text-gray-500 mt-1">
                Maximum available: {item.currentStock} {item.unit}
              </p>
            )}
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
              placeholder="Add notes about this transaction..."
            />
          </div>

          {formData.quantity && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm font-medium text-blue-900">New Stock Level:</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">
                {(parseFloat(item.currentStock) + (isRemoval ? -1 : 1) * parseFloat(formData.quantity || 0)).toFixed(2)} {item.unit}
              </p>
            </div>
          )}

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
              className={`flex-1 px-4 py-2 text-white rounded-lg hover:opacity-90 disabled:opacity-50 ${
                isRemoval ? 'bg-red-600' : 'bg-green-600'
              }`}
            >
              {saving ? 'Adjusting...' : 'Adjust Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


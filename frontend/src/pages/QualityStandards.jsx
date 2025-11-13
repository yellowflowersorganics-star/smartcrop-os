import { useState, useEffect } from 'react';
import { qualityStandardService } from '../services/api';
import { Plus, Edit2, Trash2, Copy, Check, FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const QualityStandards = () => {
  const [standards, setStandards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState(null);
  const [filters, setFilters] = useState({
    standardType: '',
    category: '',
    status: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    standardType: 'product',
    category: 'appearance',
    cropType: '',
    description: '',
    status: 'draft',
    isMandatory: false,
    isPublic: false
  });

  useEffect(() => {
    fetchStandards();
  }, [filters]);

  const fetchStandards = async () => {
    try {
      setLoading(true);
      const res = await qualityStandardService.getAll(filters);
      setStandards(res.data.standards || res.data);
    } catch (error) {
      console.error('Error fetching standards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStandard) {
        await qualityStandardService.update(editingStandard.id, formData);
      } else {
        await qualityStandardService.create(formData);
      }
      setShowModal(false);
      setEditingStandard(null);
      resetForm();
      fetchStandards();
    } catch (error) {
      console.error('Error saving standard:', error);
      alert('Failed to save standard: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (standard) => {
    setEditingStandard(standard);
    setFormData({
      name: standard.name,
      code: standard.code,
      standardType: standard.standardType,
      category: standard.category,
      cropType: standard.cropType || '',
      description: standard.description || '',
      status: standard.status,
      isMandatory: standard.isMandatory,
      isPublic: standard.isPublic
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this standard?')) return;

    try {
      await qualityStandardService.delete(id);
      fetchStandards();
    } catch (error) {
      console.error('Error deleting standard:', error);
      alert('Failed to delete standard: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await qualityStandardService.duplicate(id);
      fetchStandards();
    } catch (error) {
      console.error('Error duplicating standard:', error);
      alert('Failed to duplicate standard');
    }
  };

  const handleApprove = async (id) => {
    try {
      await qualityStandardService.approve(id);
      fetchStandards();
    } catch (error) {
      console.error('Error approving standard:', error);
      alert('Failed to approve standard');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      standardType: 'product',
      category: 'appearance',
      cropType: '',
      description: '',
      status: 'draft',
      isMandatory: false,
      isPublic: false
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/quality"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quality Standards</h1>
            <p className="text-gray-600 mt-1">Manage quality criteria and grading systems</p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingStandard(null);
            setShowModal(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Standard
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.standardType}
              onChange={(e) => handleFilterChange('standardType', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="product">Product</option>
              <option value="process">Process</option>
              <option value="environmental">Environmental</option>
              <option value="safety">Safety</option>
              <option value="hygiene">Hygiene</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="appearance">Appearance</option>
              <option value="size">Size</option>
              <option value="color">Color</option>
              <option value="texture">Texture</option>
              <option value="contamination">Contamination</option>
              <option value="packaging">Packaging</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* Standards List */}
      <div className="grid grid-cols-1 gap-4">
        {standards.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No quality standards found</p>
            <button
              onClick={() => {
                resetForm();
                setEditingStandard(null);
                setShowModal(true);
              }}
              className="mt-4 text-green-600 hover:text-green-700 font-medium"
            >
              Create your first standard
            </button>
          </div>
        ) : (
          standards.map(standard => (
            <div key={standard.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{standard.name}</h3>
                    {getStatusBadge(standard.status)}
                    {standard.isMandatory && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Mandatory
                      </span>
                    )}
                    {standard.isPublic && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Public
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{standard.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span><strong>Code:</strong> {standard.code}</span>
                    <span><strong>Type:</strong> {standard.standardType}</span>
                    <span><strong>Category:</strong> {standard.category}</span>
                    {standard.cropType && <span><strong>Crop:</strong> {standard.cropType}</span>}
                    {standard.version && <span><strong>Version:</strong> {standard.version}</span>}
                  </div>
                </div>

                <div className="flex gap-2">
                  {standard.status === 'draft' && (
                    <button
                      onClick={() => handleApprove(standard.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Approve"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(standard.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleEdit(standard)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(standard.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingStandard ? 'Edit Quality Standard' : 'New Quality Standard'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="e.g., Premium Oyster Mushroom Standard"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Leave empty for auto-generation"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="standardType"
                    value={formData.standardType}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="product">Product</option>
                    <option value="process">Process</option>
                    <option value="environmental">Environmental</option>
                    <option value="safety">Safety</option>
                    <option value="hygiene">Hygiene</option>
                    <option value="regulatory">Regulatory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="appearance">Appearance</option>
                    <option value="size">Size</option>
                    <option value="color">Color</option>
                    <option value="texture">Texture</option>
                    <option value="contamination">Contamination</option>
                    <option value="packaging">Packaging</option>
                    <option value="labeling">Labeling</option>
                    <option value="weight">Weight</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Crop Type
                  </label>
                  <input
                    type="text"
                    name="cropType"
                    value={formData.cropType}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Oyster Mushroom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Detailed description of this quality standard..."
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isMandatory"
                    checked={formData.isMandatory}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Mandatory</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Public (visible to all users)</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStandard(null);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingStandard ? 'Update Standard' : 'Create Standard'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QualityStandards;


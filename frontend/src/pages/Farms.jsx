import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, MapPin, Grid3x3, Edit2, Trash2, X, Building2 } from 'lucide-react';
import api from '../services/api';

export default function Farms() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
    farmType: 'vertical',
    totalArea: '',
    units: 'sqft'
  });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchFarms();
  }, []);

  const fetchFarms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farms');
      setFarms(response.data.data || []);
    } catch (error) {
      console.error('Error fetching farms:', error);
      setError('Failed to load farms');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingFarm) {
        // Update existing farm
        await api.put(`/farms/${editingFarm.id}`, formData);
      } else {
        // Create new farm
        await api.post('/farms', formData);
      }
      
      // Refresh list and close modal
      fetchFarms();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving farm:', error);
      setError(error.response?.data?.message || 'Failed to save farm');
    }
  };

  const handleEdit = (farm) => {
    setEditingFarm(farm);
    setFormData({
      name: farm.name,
      location: farm.location || '',
      description: farm.description || '',
      farmType: farm.farmType || 'vertical',
      totalArea: farm.totalArea || '',
      units: farm.units || 'sqft'
    });
    setShowModal(true);
  };

  const handleDelete = async (farmId) => {
    try {
      await api.delete(`/farms/${farmId}`);
      fetchFarms();
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting farm:', error);
      setError('Failed to delete farm');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFarm(null);
    setFormData({
      name: '',
      location: '',
      description: '',
      farmType: 'vertical',
      totalArea: '',
      units: 'sqft'
    });
    setError('');
  };

  const getFarmTypeIcon = (type) => {
    switch(type) {
      case 'vertical': return '🏢';
      case 'greenhouse': return '🏠';
      case 'indoor': return '🏭';
      case 'outdoor': return '🌾';
      default: return '🌱';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Farms</h1>
          <p className="text-gray-600 mt-1">Manage your agricultural operations</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Farm
        </button>
      </div>

      {/* Error Message */}
      {error && !showModal && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Empty State */}
      {farms.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No farms yet</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first farm</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your First Farm
          </button>
        </div>
      )}

      {/* Farms Grid */}
      {farms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farms.map((farm) => (
            <div
              key={farm.id}
              className="card hover:shadow-lg transition-shadow duration-200"
            >
              {/* Farm Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getFarmTypeIcon(farm.farmType)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{farm.name}</h3>
                    {farm.location && (
                      <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {farm.location}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Farm Details */}
              {farm.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {farm.description}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-200">
                <div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
                    <Grid3x3 className="w-4 h-4" />
                    Zones
                  </div>
                  <div className="text-2xl font-bold text-gray-900">
                    {farm.zones?.length || 0}
                  </div>
                </div>
                {farm.totalArea && (
                  <div>
                    <div className="text-gray-600 text-sm mb-1">Total Area</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {farm.totalArea}
                      <span className="text-sm font-normal text-gray-600 ml-1">
                        {farm.units}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Farm Type Badge */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full capitalize">
                  {farm.farmType || 'vertical'} farm
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Link
                  to={`/farms/${farm.id}`}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  View Details
                </Link>
                <button
                  onClick={() => handleEdit(farm)}
                  className="btn btn-secondary p-2"
                  title="Edit farm"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(farm.id)}
                  className="btn bg-red-50 text-red-600 hover:bg-red-100 p-2"
                  title="Delete farm"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Farm Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingFarm ? 'Edit Farm' : 'Create New Farm'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Farm Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g., Green Valley Farm"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g., Bangalore, Karnataka"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {/* Farm Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Farm Type *
                  </label>
                  <select
                    required
                    className="input"
                    value={formData.farmType}
                    onChange={(e) => setFormData({ ...formData, farmType: e.target.value })}
                  >
                    <option value="vertical">Vertical Farm</option>
                    <option value="greenhouse">Greenhouse</option>
                    <option value="indoor">Indoor Farm</option>
                    <option value="outdoor">Outdoor Farm</option>
                    <option value="hydroponic">Hydroponic</option>
                    <option value="mushroom">Mushroom Farm</option>
                  </select>
                </div>

                {/* Total Area */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total Area
                    </label>
                    <input
                      type="number"
                      className="input"
                      placeholder="1000"
                      value={formData.totalArea}
                      onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units
                    </label>
                    <select
                      className="input"
                      value={formData.units}
                      onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                    >
                      <option value="sqft">sq ft</option>
                      <option value="sqm">sq m</option>
                      <option value="acre">acre</option>
                      <option value="hectare">hectare</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="input"
                    rows="3"
                    placeholder="Describe your farm..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary"
                >
                  {editingFarm ? 'Update Farm' : 'Create Farm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Farm?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this farm? This action cannot be undone. 
              All zones and data associated with this farm will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 btn bg-red-600 text-white hover:bg-red-700"
              >
                Delete Farm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

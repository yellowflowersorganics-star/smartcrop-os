import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, X, MapPin, Layers, Activity, 
  Calendar, Sprout, AlertCircle, Clock, CheckCircle2,
  PauseCircle, PlayCircle, XCircle
} from 'lucide-react';
import api from '../services/api';
import { CardsGridSkeleton } from '../components/skeletons';

export default function Zones() {
  const [zones, setZones] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [selectedFarm, setSelectedFarm] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    farmId: '',
    zoneNumber: '',
    area: '',
    plantCount: '',
    status: 'idle',
    metadata: {}
  });
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchData();
  }, [selectedFarm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch farms first
      const farmsResponse = await api.get('/farms');
      setFarms(farmsResponse.data.data || []);

      // Fetch zones with optional farm filter
      const zonesUrl = selectedFarm !== 'all' ? `/zones?farmId=${selectedFarm}` : '/zones';
      const zonesResponse = await api.get(zonesUrl);
      setZones(zonesResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Prepare data with proper type conversions
      const submitData = {
        ...formData,
        area: formData.area ? parseFloat(formData.area) : null,
        plantCount: formData.plantCount ? parseInt(formData.plantCount) : 0,
        farmId: formData.farmId || null
      };

      if (editingZone) {
        await api.put(`/zones/${editingZone.id}`, submitData);
      } else {
        await api.post('/zones', submitData);
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving zone:', error);
      setError(error.response?.data?.message || 'Failed to save zone');
    }
  };

  const handleEdit = (zone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      farmId: zone.farmId || '',
      zoneNumber: zone.zoneNumber || '',
      area: zone.area || '',
      plantCount: zone.plantCount || '',
      status: zone.status || 'idle',
      metadata: zone.metadata || {}
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/zones/${id}`);
      setDeleteConfirm(null);
      fetchData();
    } catch (error) {
      console.error('Error deleting zone:', error);
      setError('Failed to delete zone');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      farmId: '',
      zoneNumber: '',
      area: '',
      plantCount: '',
      status: 'idle',
      metadata: {}
    });
    setEditingZone(null);
    setError('');
  };

  const getStatusIcon = (status) => {
    const icons = {
      idle: <PauseCircle className="w-4 h-4" />,
      active: <PlayCircle className="w-4 h-4" />,
      maintenance: <Clock className="w-4 h-4" />,
      retired: <XCircle className="w-4 h-4" />
    };
    return icons[status] || icons.idle;
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      maintenance: 'bg-yellow-100 text-yellow-800',
      retired: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.idle;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysRunning = (startDate) => {
    if (!startDate) return null;
    const days = Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="animate-pulse space-y-2">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
          </div>
          <div className="animate-pulse h-10 bg-gray-200 rounded w-40"></div>
        </div>
        <CardsGridSkeleton count={6} columns={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zone Management</h1>
          <p className="text-gray-600 mt-1">Manage your growing zones and monitor their status</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Zone
        </button>
      </div>

      {/* Farm Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by Farm:</label>
          <select
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Farms</option>
            {farms.map((farm) => (
              <option key={farm.id} value={farm.id}>
                {farm.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {zones.length} {zones.length === 1 ? 'zone' : 'zones'} found
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Zones Grid */}
      {zones.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No zones yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first growing zone
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Your First Zone
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => {
            const daysRunning = getDaysRunning(zone.batchStartDate);
            return (
              <div
                key={zone.id}
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
              >
                {/* Zone Header */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <Link
                        to={`/zones/${zone.id}`}
                        className="text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors"
                      >
                        {zone.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        {zone.zoneNumber && (
                          <span className="text-sm text-gray-500">#{zone.zoneNumber}</span>
                        )}
                        {zone.farm && (
                          <>
                            {zone.zoneNumber && <span className="text-gray-300">•</span>}
                            <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50 px-2 py-0.5 rounded">
                              <MapPin className="w-3.5 h-3.5" />
                              <span className="font-medium">{zone.farm.name}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(zone)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit zone"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(zone.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete zone"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(zone.status)}`}>
                      {getStatusIcon(zone.status)}
                      {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
                    </span>
                  </div>

                  {/* Zone Info */}
                  <div className="space-y-2">

                    {zone.area && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Layers className="w-4 h-4" />
                        <span>{zone.area} m²</span>
                      </div>
                    )}

                    {zone.activeRecipe && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Sprout className="w-4 h-4" />
                        <span>{zone.activeRecipe.cropName}</span>
                      </div>
                    )}

                    {zone.plantCount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Activity className="w-4 h-4" />
                        <span>{zone.plantCount} plants</span>
                      </div>
                    )}

                    {zone.batchStartDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Started {formatDate(zone.batchStartDate)}</span>
                      </div>
                    )}

                    {daysRunning !== null && zone.status === 'running' && (
                      <div className="mt-2 p-2 bg-green-50 rounded text-sm text-green-800 font-medium">
                        Day {daysRunning} of growth cycle
                      </div>
                    )}
                  </div>
                </div>

                {/* Zone Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                  <Link
                    to={`/zones/${zone.id}`}
                    className="text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingZone ? 'Edit Zone' : 'Create New Zone'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zone Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., Zone A1, Growing Room 3"
                  />
                </div>

                {/* Farm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm
                  </label>
                  <select
                    value={formData.farmId}
                    onChange={(e) => setFormData({ ...formData, farmId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Select a farm</option>
                    {farms.map((farm) => (
                      <option key={farm.id} value={farm.id}>
                        {farm.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Zone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Zone Number
                  </label>
                  <input
                    type="text"
                    value={formData.zoneNumber}
                    onChange={(e) => setFormData({ ...formData, zoneNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., A1, Room-3"
                  />
                </div>

                {/* Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Area (m²)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="100"
                  />
                </div>

                {/* Plant Count */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plant Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.plantCount}
                    onChange={(e) => setFormData({ ...formData, plantCount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter plant count"
                  />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="idle">Idle</option>
                    <option value="active">Active</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Zone</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this zone? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

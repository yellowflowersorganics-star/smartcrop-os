import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, MapPin, Layers, Activity, 
  Calendar, Sprout, Thermometer, Droplets, Wind, Sun,
  PlayCircle, PauseCircle, CheckCircle2, AlertCircle,
  Clock, TrendingUp, BarChart3, Plus, X, History, Package
} from 'lucide-react';
import api from '../services/api';
import HarvestRecording from '../components/HarvestRecording';
import EnvironmentalMonitoring from '../components/EnvironmentalMonitoring';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function ZoneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [zone, setZone] = useState(null);
  const [activeBatch, setActiveBatch] = useState(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatUnits = (units) => {
    const unitMap = {
      'sqft': 'sq ft',
      'sqm': 'sq m',
      'acre': 'acre',
      'hectare': 'hectare'
    };
    return unitMap[units] || 'sq ft';
  };
  
  // Modals
  const [showStartBatchModal, setShowStartBatchModal] = useState(false);
  const [showCompleteBatchModal, setShowCompleteBatchModal] = useState(false);
  const [showHarvestModal, setShowHarvestModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  
  // Harvest data
  const [harvests, setHarvests] = useState([]);
  
  // Form data
  const [startBatchData, setStartBatchData] = useState({
    recipeId: '',
    plantCount: '',
    startDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [completeBatchData, setCompleteBatchData] = useState({
    notes: '',
    status: 'completed',
    failureReason: ''
  });

  useEffect(() => {
    fetchAllData();
  }, [id]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchZoneDetail(),
        fetchActiveBatch(),
        fetchBatchHistory(),
        fetchRecipes(),
        fetchHarvests()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchZoneDetail = async () => {
    const response = await api.get(`/zones/${id}`);
    setZone(response.data.data);
  };

  const fetchActiveBatch = async () => {
    try {
      const response = await api.get(`/batches/zone/${id}/active`);
      setActiveBatch(response.data.data);
    } catch (error) {
      console.error('Error fetching active batch:', error);
      setActiveBatch(null);
    }
  };

  const fetchBatchHistory = async () => {
    try {
      const response = await api.get(`/batches/zone/${id}/history`);
      setBatchHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching batch history:', error);
      setBatchHistory([]);
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await api.get('/crop-recipes');
      setRecipes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setRecipes([]);
    }
  };

  const fetchHarvests = async () => {
    try {
      const response = await api.get(`/harvests?zoneId=${id}`);
      setHarvests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching harvests:', error);
      setHarvests([]);
    }
  };

  const handleStartBatch = async (e) => {
    e.preventDefault();
    try {
      console.log('Starting batch with data:', {
        zoneId: id,
        ...startBatchData,
        plantCount: parseInt(startBatchData.plantCount) || 0
      });
      
      await api.post('/batches/start', {
        zoneId: id,
        ...startBatchData,
        plantCount: parseInt(startBatchData.plantCount) || 0
      });
      
      setShowStartBatchModal(false);
      setStartBatchData({
        recipeId: '',
        plantCount: '',
        startDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      
      await fetchAllData();
    } catch (error) {
      console.error('Error starting batch:', error);
      console.error('Full error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to start batch';
      const errorDetails = error.response?.data?.error;
      setError(errorDetails ? `${errorMsg}\n${errorDetails}` : errorMsg);
      toast.error(`Failed to start batch: ${errorMsg}`);
    }
  };

  const handleCompleteBatch = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/batches/${activeBatch.id}/complete`, completeBatchData);
      
      setShowCompleteBatchModal(false);
      setCompleteBatchData({
        notes: '',
        status: 'completed',
        failureReason: ''
      });
      
      await fetchAllData();
    } catch (error) {
      console.error('Error completing batch:', error);
      setError(error.response?.data?.message || 'Failed to complete batch');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/zones/${id}`);
      toast.success('Zone deleted successfully!');
      navigate('/zones');
    } catch (error) {
      console.error('Error deleting zone:', error);
      toast.error('Failed to delete zone');
      setError('Failed to delete zone');
    } finally {
      setDeleteDialog(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      idle: <PauseCircle className="w-5 h-5" />,
      running: <PlayCircle className="w-5 h-5" />,
      paused: <Clock className="w-5 h-5" />,
      completed: <CheckCircle2 className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />
    };
    return icons[status] || icons.idle;
  };

  const getStatusColor = (status) => {
    const colors = {
      idle: 'bg-gray-100 text-gray-800',
      running: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      error: 'bg-red-100 text-red-800',
      active: 'bg-green-100 text-green-800',
      planned: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
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

  const getProgress = (batch) => {
    if (!batch || !batch.startDate || !batch.cycleDuration) return 0;
    const daysRunning = getDaysRunning(batch.startDate);
    return Math.min(100, Math.round((daysRunning / batch.cycleDuration) * 100));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading zone details...</div>
      </div>
    );
  }

  if (error && !zone) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  const daysRunning = activeBatch ? getDaysRunning(activeBatch.startDate) : null;
  const progress = activeBatch ? getProgress(activeBatch) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/zones"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{zone.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              {zone.zoneNumber && (
                <p className="text-gray-600">Zone #{zone.zoneNumber}</p>
              )}
              {zone.farm && (
                <>
                  {zone.zoneNumber && <span className="text-gray-400">•</span>}
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                    <MapPin className="w-4 h-4" />
                    <span className="font-medium">{zone.farm.name}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/zones/${id}/edit`)}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => setDeleteDialog(true)}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Current Batch */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Batch</h2>
          {activeBatch ? (
            <div className="flex gap-2">
              <button
                onClick={() => setShowHarvestModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                Record Harvest
              </button>
              <button
                onClick={() => setShowCompleteBatchModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Complete Batch
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowStartBatchModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Start New Batch
            </button>
          )}
        </div>

        {activeBatch ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batch Number</p>
                <p className="text-lg font-semibold text-gray-900">{activeBatch.batchNumber}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(activeBatch.status)}`}>
                {activeBatch.status.charAt(0).toUpperCase() + activeBatch.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Crop</p>
                <p className="font-medium text-gray-900">{activeBatch.cropName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Started</p>
                <p className="font-medium text-gray-900">{formatDate(activeBatch.startDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Expected Harvest</p>
                <p className="font-medium text-gray-900">{formatDate(activeBatch.expectedEndDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Plant Count</p>
                <p className="font-medium text-gray-900">{activeBatch.plantCount || 0}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Growth Cycle Progress</span>
                <span className="font-medium text-gray-900">Day {daysRunning} of {activeBatch.cycleDuration}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{progress}% complete</p>
            </div>

            {activeBatch.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="text-gray-900">{activeBatch.notes}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No active batch in this zone</p>
            <p className="text-sm text-gray-500 mt-1">Start a new growing cycle to begin tracking</p>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {zone.farm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Farm</h3>
            </div>
            <Link 
              to={`/farms/${zone.farm.id}`}
              className="text-lg text-blue-600 hover:text-blue-700 font-medium"
            >
              {zone.farm.name}
            </Link>
          </div>
        )}

        {zone.area && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Area</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{zone.area} {formatUnits(zone.units)}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Current Plants</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{activeBatch?.plantCount || zone.plantCount || 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <History className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Total Batches</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{batchHistory.length}</p>
        </div>
      </div>

      {/* Environmental Monitoring */}
      <EnvironmentalMonitoring 
        zoneId={id}
        activeRecipe={zone?.activeRecipe}
      />

      {/* Harvest History */}
      {activeBatch && harvests.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Harvest Records</h2>
          </div>

          <div className="space-y-3">
            {harvests
              .filter(h => h.batchId === activeBatch.batchNumber)
              .sort((a, b) => b.flushNumber - a.flushNumber)
              .map((harvest) => (
              <div
                key={harvest.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-900">Flush {harvest.flushNumber}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      harvest.qualityGrade === 'premium' ? 'bg-purple-100 text-purple-800' :
                      harvest.qualityGrade === 'grade_a' ? 'bg-green-100 text-green-800' :
                      harvest.qualityGrade === 'grade_b' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {harvest.qualityGrade?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(harvest.harvestDate)}
                    {harvest.bagsHarvested > 0 && ` • ${harvest.bagsHarvested} bags`}
                  </p>
                  {harvest.notes && (
                    <p className="text-xs text-gray-500 mt-1">{harvest.notes}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">{harvest.totalWeightKg} kg</p>
                  {harvest.bagsDiscarded > 0 && (
                    <p className="text-xs text-red-600">{harvest.bagsDiscarded} bags discarded</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600">Total Harvested:</span>
                <p className="text-2xl font-bold text-green-600">
                  {harvests
                    .filter(h => h.batchId === activeBatch.batchNumber)
                    .reduce((sum, h) => sum + (h.totalWeightKg || 0), 0)
                    .toFixed(2)} kg
                </p>
              </div>
              {activeBatch.plantCount > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Bio-Efficiency:</span>
                  <p className="text-2xl font-bold text-blue-600">
                    {(
                      (harvests
                        .filter(h => h.batchId === activeBatch.batchNumber)
                        .reduce((sum, h) => sum + (h.totalWeightKg || 0), 0) / 
                      activeBatch.plantCount) * 100
                    ).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Based on {activeBatch.plantCount} bags
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Batch History */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <History className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Batch History</h2>
        </div>

        {batchHistory.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No batch history yet</p>
        ) : (
          <div className="space-y-3">
            {batchHistory.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <p className="font-medium text-gray-900">{batch.cropName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}>
                      {batch.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {formatDate(batch.startDate)} → {formatDate(batch.actualEndDate || batch.expectedEndDate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {batch.batchNumber} • {batch.plantCount} plants
                    {batch.totalYieldKg && ` • ${batch.totalYieldKg} kg harvested`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{batch.cycleDuration} days</p>
                  {batch.totalYieldKg && (
                    <p className="text-xs text-green-600 font-medium">✓ Harvested</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Batch Modal */}
      {showStartBatchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Start New Batch</h2>
              <button
                onClick={() => setShowStartBatchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleStartBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Growing Recipe *
                </label>
                <select
                  required
                  value={startBatchData.recipeId}
                  onChange={(e) => setStartBatchData({ ...startBatchData, recipeId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Select a growing recipe</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.cropName} ({recipe.totalDuration} days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plant Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={startBatchData.plantCount}
                  onChange={(e) => setStartBatchData({ ...startBatchData, plantCount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter plant count"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={startBatchData.startDate}
                  onChange={(e) => setStartBatchData({ ...startBatchData, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={startBatchData.notes}
                  onChange={(e) => setStartBatchData({ ...startBatchData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Optional batch notes"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowStartBatchModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Start Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Batch Modal */}
      {showCompleteBatchModal && activeBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Complete Batch</h2>
              <button
                onClick={() => setShowCompleteBatchModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCompleteBatch} className="p-6 space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700">
                  <strong>Batch:</strong> {activeBatch.batchNumber}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Crop:</strong> {activeBatch.cropName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Duration:</strong> {daysRunning} days
                </p>
              </div>

              {/* Batch Summary - Read Only */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-blue-900 mb-2">Batch Summary</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Yield</p>
                    <p className="text-xl font-bold text-gray-900">{activeBatch?.totalYieldKg || 0} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Harvest Count</p>
                    <p className="text-xl font-bold text-gray-900">{activeBatch?.harvestCount || 0} flushes</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Plant Count</p>
                    <p className="text-xl font-bold text-gray-900">{activeBatch?.plantCount || 0} bags</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-xl font-bold text-gray-900">
                      {activeBatch?.startDate ? Math.floor((new Date() - new Date(activeBatch.startDate)) / (1000 * 60 * 60 * 24)) : 0} days
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={completeBatchData.status}
                  onChange={(e) => setCompleteBatchData({ ...completeBatchData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="completed">Completed Successfully</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {completeBatchData.status === 'failed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Failure Reason *
                  </label>
                  <textarea
                    value={completeBatchData.failureReason}
                    onChange={(e) => setCompleteBatchData({ ...completeBatchData, failureReason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    rows="2"
                    placeholder="Describe what went wrong..."
                    required={completeBatchData.status === 'failed'}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Completion Notes
                </label>
                <textarea
                  value={completeBatchData.notes}
                  onChange={(e) => setCompleteBatchData({ ...completeBatchData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows="3"
                  placeholder="Final observations, learnings, improvements..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCompleteBatchModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Complete Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Harvest Recording Modal */}
      {showHarvestModal && activeBatch && (
        <HarvestRecording
          batch={activeBatch}
          onClose={() => setShowHarvestModal(false)}
          onSuccess={() => {
            fetchAllData();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Zone"
        message="Are you sure you want to delete this zone? All batches, harvest records, and telemetry data will be deleted. This action cannot be undone."
        confirmText="Delete Zone"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

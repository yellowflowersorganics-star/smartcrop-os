import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, MapPin, Layers, Activity, 
  Calendar, Sprout, Thermometer, Droplets, Wind, Sun,
  PlayCircle, PauseCircle, CheckCircle2, AlertCircle,
  Clock, TrendingUp, BarChart3
} from 'lucide-react';
import api from '../services/api';

export default function ZoneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchZoneDetail();
  }, [id]);

  const fetchZoneDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/zones/${id}`);
      setZone(response.data.data);
    } catch (error) {
      console.error('Error fetching zone details:', error);
      setError('Failed to load zone details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this zone?')) {
      return;
    }

    try {
      await api.delete(`/zones/${id}`);
      navigate('/zones');
    } catch (error) {
      console.error('Error deleting zone:', error);
      setError('Failed to delete zone');
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
      error: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.idle;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRunning = (startDate) => {
    if (!startDate) return null;
    const days = Math.floor((new Date() - new Date(startDate)) / (1000 * 60 * 60 * 24));
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading zone details...</div>
      </div>
    );
  }

  if (error || !zone) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error || 'Zone not found'}
      </div>
    );
  }

  const daysRunning = getDaysRunning(zone.batchStartDate);

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
            <p className="text-gray-600 mt-1">
              {zone.zoneNumber ? `Zone #${zone.zoneNumber}` : 'Zone Details'}
            </p>
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
            onClick={handleDelete}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Status</h2>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(zone.status)}`}>
              {getStatusIcon(zone.status)}
              {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
            </div>
          </div>
          {daysRunning !== null && zone.status === 'running' && (
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Growth Cycle Progress</p>
              <p className="text-3xl font-bold text-green-600">Day {daysRunning}</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Farm */}
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

        {/* Area */}
        {zone.area && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layers className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Area</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{zone.area} m²</p>
          </div>
        )}

        {/* Plant Count */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Plants</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{zone.plantCount || 0}</p>
        </div>

        {/* Current Stage */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Stage</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">Stage {zone.currentStage || 0}</p>
        </div>
      </div>

      {/* Active Recipe */}
      {zone.activeRecipe && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Sprout className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Active Recipe</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Recipe Name</p>
              <p className="font-medium text-gray-900">{zone.activeRecipe.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Crop Type</p>
              <p className="font-medium text-gray-900">{zone.activeRecipe.cropType || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Stage</p>
              <p className="font-medium text-gray-900">Stage {zone.currentStage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Batch Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Batch Timeline</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="font-medium text-gray-900">{formatDate(zone.batchStartDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Expected Harvest</p>
            <p className="font-medium text-gray-900">{formatDate(zone.batchEndDate)}</p>
          </div>
        </div>
      </div>

      {/* Environmental Data */}
      {zone.lastEnvironmentData && Object.keys(zone.lastEnvironmentData).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Environmental Data</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {zone.lastEnvironmentData.temperature && (
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Thermometer className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-600">Temperature</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {zone.lastEnvironmentData.temperature}°C
                </p>
              </div>
            )}
            {zone.lastEnvironmentData.humidity && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-600">Humidity</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {zone.lastEnvironmentData.humidity}%
                </p>
              </div>
            )}
            {zone.lastEnvironmentData.co2 && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Wind className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">CO₂</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {zone.lastEnvironmentData.co2} ppm
                </p>
              </div>
            )}
            {zone.lastEnvironmentData.light && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Sun className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm text-gray-600">Light</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {zone.lastEnvironmentData.light} lux
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Devices */}
      {zone.devices && zone.devices.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Connected Devices</h2>
          <div className="space-y-3">
            {zone.devices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{device.name}</p>
                  <p className="text-sm text-gray-600">{device.deviceType}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  device.status === 'online' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {device.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metadata */}
      {zone.metadata && Object.keys(zone.metadata).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm text-gray-700 overflow-x-auto">
              {JSON.stringify(zone.metadata, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

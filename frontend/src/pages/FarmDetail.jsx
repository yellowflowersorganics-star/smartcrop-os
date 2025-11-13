import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Grid3x3, Plus, Edit2, Thermometer, Droplets } from 'lucide-react';
import api from '../services/api';

export default function FarmDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFarmDetail();
  }, [id]);

  const fetchFarmDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/farms/${id}`);
      setFarm(response.data.data);
    } catch (error) {
      console.error('Error fetching farm:', error);
      setError('Failed to load farm details');
    } finally {
      setLoading(false);
    }
  };

  const getFarmTypeIcon = (type) => {
    switch(type) {
      case 'vertical': return '🏢';
      case 'greenhouse': return '🏠';
      case 'indoor': return '🏭';
      case 'outdoor': return '🌾';
      case 'hydroponic': return '💧';
      case 'mushroom': return '🍄';
      default: return '🌱';
    }
  };

  // Format units for display
  const formatUnits = (unit) => {
    const unitMap = {
      'sqft': 'sq ft',
      'sqm': 'm²',
      'acre': 'acres',
      'hectare': 'hectares'
    };
    return unitMap[unit] || unit;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error || !farm) {
    return (
      <div>
        <Link to="/farms" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Farms
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || 'Farm not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Link to="/farms" className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-4">
        <ArrowLeft className="w-4 h-4" />
        Back to Farms
      </Link>

      {/* Farm Header */}
      <div className="card mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{getFarmTypeIcon(farm.farmType)}</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{farm.name}</h1>
              {farm.location && (
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <MapPin className="w-5 h-5" />
                  {farm.location}
                </div>
              )}
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full capitalize">
                  {farm.farmType || 'vertical'} farm
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/farms')}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Edit Farm
          </button>
        </div>

        {farm.description && (
          <p className="text-gray-600 mt-6 text-lg">{farm.description}</p>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary-100 p-3 rounded-lg">
              <Grid3x3 className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Zones</div>
              <div className="text-3xl font-bold text-gray-900">
                {farm.zones?.length || 0}
              </div>
            </div>
          </div>
        </div>

        {farm.totalArea && (
          <div className="card">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-100 p-3 rounded-lg">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">Total Area</div>
                <div className="text-3xl font-bold text-gray-900">
                  {farm.totalArea}
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    {formatUnits(farm.units)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-100 p-3 rounded-lg">
              <Thermometer className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Active Zones</div>
              <div className="text-3xl font-bold text-gray-900">
                {farm.zones?.filter(z => z.isActive).length || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zones Section */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Zones</h2>
          <Link to="/zones" className="btn btn-primary flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Zone
          </Link>
        </div>

        {(!farm.zones || farm.zones.length === 0) && (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Grid3x3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No zones yet</h3>
            <p className="text-gray-600 mb-4">Create zones to start monitoring and controlling your crops</p>
            <Link to="/zones" className="btn btn-primary inline-flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create First Zone
            </Link>
          </div>
        )}

        {farm.zones && farm.zones.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {farm.zones.map((zone) => (
              <Link
                key={zone.id}
                to={`/zones/${zone.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{zone.name}</h3>
                    {zone.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{zone.description}</p>
                    )}
                  </div>
                  {zone.isActive && (
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </div>

                {zone.currentCrop && (
                  <div className="text-sm text-gray-600 mb-2">
                    🌱 {zone.currentCrop}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
                  {zone.currentTemperature && (
                    <div className="flex items-center gap-1 text-sm">
                      <Thermometer className="w-4 h-4 text-gray-400" />
                      <span>{zone.currentTemperature}°C</span>
                    </div>
                  )}
                  {zone.currentHumidity && (
                    <div className="flex items-center gap-1 text-sm">
                      <Droplets className="w-4 h-4 text-gray-400" />
                      <span>{zone.currentHumidity}%</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Farm Metadata */}
      <div className="card mt-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Farm Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Farm ID</div>
            <div className="font-mono text-sm text-gray-900">{farm.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600 mb-1">Created</div>
            <div className="text-sm text-gray-900">
              {new Date(farm.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
          {farm.updatedAt && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Last Updated</div>
              <div className="text-sm text-gray-900">
                {new Date(farm.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


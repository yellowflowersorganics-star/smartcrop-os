import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentService } from '../services/equipment.service';
import { useToast } from '../context/ToastContext';

const EquipmentControl = () => {
  const [equipment, setEquipment] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState('all');
  const [loading, setLoading] = useState(true);
  const [controlLoading, setControlLoading] = useState({});
  const { showToast } = useToast();

  useEffect(() => {
    fetchEquipment();
    // Refresh every 10 seconds
    const interval = setInterval(fetchEquipment, 10000);
    return () => clearInterval(interval);
  }, [selectedZone]);

  const fetchEquipment = async () => {
    try {
      const data = await equipmentService.getAllEquipment();
      setEquipment(data);
      
      // Extract unique zones
      const uniqueZones = [...new Set(data.map(e => e.Zone?.name).filter(Boolean))];
      setZones(uniqueZones);
    } catch (error) {
      showToast(error.message || 'Failed to load equipment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleControl = async (equipmentId, action, value = null) => {
    setControlLoading(prev => ({ ...prev, [equipmentId]: true }));
    
    try {
      let result;
      switch (action) {
        case 'on':
          result = await equipmentService.turnOn(equipmentId);
          showToast(`${result.equipment.name} turned ON`, 'success');
          break;
        case 'off':
          result = await equipmentService.turnOff(equipmentId);
          showToast(`${result.equipment.name} turned OFF`, 'success');
          break;
        case 'setValue':
          result = await equipmentService.setValue(equipmentId, value);
          showToast(`${result.equipment.name} set to ${value}%`, 'success');
          break;
        case 'setMode':
          result = await equipmentService.setMode(equipmentId, value);
          showToast(`${result.equipment.name} mode: ${value}`, 'success');
          break;
      }
      
      // Refresh equipment list
      await fetchEquipment();
    } catch (error) {
      showToast(error.message || 'Control command failed', 'error');
    } finally {
      setControlLoading(prev => ({ ...prev, [equipmentId]: false }));
    }
  };

  const filteredEquipment = selectedZone === 'all' 
    ? equipment 
    : equipment.filter(e => e.Zone?.name === selectedZone);

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getModeColor = (mode) => {
    switch (mode) {
      case 'auto': return 'text-blue-600 bg-blue-100';
      case 'manual': return 'text-purple-600 bg-purple-100';
      case 'off': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getControlTypeIcon = (type) => {
    switch (type) {
      case 'relay': return '🔌';
      case 'pwm': return '⚡';
      case 'analog': return '📊';
      case 'serial': return '📡';
      default: return '🔧';
    }
  };

  if (loading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipment Control</h1>
          <p className="text-gray-600 mt-1">Monitor and control zone equipment</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Zone Filter */}
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Zones</option>
            {zones.map(zone => (
              <option key={zone} value={zone}>{zone}</option>
            ))}
          </select>

          {/* Add Equipment Button */}
          <Link
            to="/equipment/new"
            className="btn btn-primary"
          >
            + Add Equipment
          </Link>
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipment.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Equipment Found</h3>
          <p className="text-gray-600 mb-6">
            {selectedZone === 'all' 
              ? "Add your first equipment to start controlling your zone"
              : `No equipment found in ${selectedZone}`}
          </p>
          <Link to="/equipment/new" className="btn btn-primary">
            + Add Equipment
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onControl={handleControl}
              loading={controlLoading[item.id]}
              getStatusColor={getStatusColor}
              getModeColor={getModeColor}
              getControlTypeIcon={getControlTypeIcon}
            />
          ))}
        </div>
      )}

      {/* Legend */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Control Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔌</span>
            <span className="text-gray-700">Relay (ON/OFF)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <span className="text-gray-700">PWM (0-100%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="text-gray-700">Analog</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📡</span>
            <span className="text-gray-700">Serial</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Equipment Card Component
const EquipmentCard = ({ equipment, onControl, loading, getStatusColor, getModeColor, getControlTypeIcon }) => {
  const [sliderValue, setSliderValue] = useState(equipment.currentValue || 0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const isRelay = equipment.controlType === 'relay';
  const isPWM = equipment.controlType === 'pwm';
  const isOn = equipment.currentValue > 0 || equipment.status === 'online';

  const handleSliderChange = (value) => {
    setSliderValue(value);
  };

  const handleSliderRelease = () => {
    onControl(equipment.id, 'setValue', sliderValue);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 px-6 py-4 border-b">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">{getControlTypeIcon(equipment.controlType)}</span>
              <h3 className="text-lg font-semibold text-gray-900">{equipment.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{equipment.type}</p>
            {equipment.Zone && (
              <p className="text-xs text-gray-500 mt-1">📍 {equipment.Zone.name}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(equipment.status)}`}>
              {equipment.status}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(equipment.mode)}`}>
              {equipment.mode}
            </span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="px-6 py-4">
        {/* Current Value Display */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Current Value</span>
            <span className="text-2xl font-bold text-gray-900">
              {equipment.currentValue || 0}
              {isPWM && '%'}
            </span>
          </div>
          
          {/* Visual Indicator */}
          {isPWM && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${equipment.currentValue || 0}%` }}
              ></div>
            </div>
          )}
          
          {isRelay && (
            <div className={`w-full h-2 rounded-full transition-all duration-300 ${isOn ? 'bg-green-600' : 'bg-gray-200'}`}></div>
          )}
        </div>

        {/* Target Value (if different) */}
        {equipment.targetValue !== null && equipment.targetValue !== equipment.currentValue && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-700 font-medium">Target:</span>
              <span className="text-blue-900 font-semibold">
                {equipment.targetValue}{isPWM && '%'}
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-3">
          {/* Relay Controls (ON/OFF) */}
          {isRelay && (
            <div className="flex gap-2">
              <button
                onClick={() => onControl(equipment.id, 'on')}
                disabled={loading || equipment.mode === 'auto'}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  isOn 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Loading...' : 'ON'}
              </button>
              <button
                onClick={() => onControl(equipment.id, 'off')}
                disabled={loading || equipment.mode === 'auto'}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  !isOn 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Loading...' : 'OFF'}
              </button>
            </div>
          )}

          {/* PWM Controls (Slider) */}
          {isPWM && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                onMouseUp={handleSliderRelease}
                onTouchEnd={handleSliderRelease}
                disabled={loading || equipment.mode === 'auto'}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${sliderValue}%, #e5e7eb ${sliderValue}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSliderValue(0);
                    onControl(equipment.id, 'setValue', 0);
                  }}
                  disabled={loading || equipment.mode === 'auto'}
                  className="flex-1 py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Off
                </button>
                <button
                  onClick={() => {
                    setSliderValue(50);
                    onControl(equipment.id, 'setValue', 50);
                  }}
                  disabled={loading || equipment.mode === 'auto'}
                  className="flex-1 py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  50%
                </button>
                <button
                  onClick={() => {
                    setSliderValue(100);
                    onControl(equipment.id, 'setValue', 100);
                  }}
                  disabled={loading || equipment.mode === 'auto'}
                  className="flex-1 py-2 px-3 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Max
                </button>
              </div>
            </div>
          )}

          {/* Mode Toggle */}
          <div className="flex gap-2 pt-3 border-t">
            <button
              onClick={() => onControl(equipment.id, 'setMode', 'auto')}
              disabled={loading}
              className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                equipment.mode === 'auto'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Auto
            </button>
            <button
              onClick={() => onControl(equipment.id, 'setMode', 'manual')}
              disabled={loading}
              className={`flex-1 py-2 px-3 text-sm rounded-lg font-medium transition-colors ${
                equipment.mode === 'manual'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              Manual
            </button>
          </div>
        </div>

        {/* Advanced Info Toggle */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          {showAdvanced ? '▲ Hide Details' : '▼ Show Details'}
        </button>

        {/* Advanced Info */}
        {showAdvanced && (
          <div className="mt-3 pt-3 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Device ID:</span>
              <span className="text-gray-900 font-mono text-xs">{equipment.deviceId}</span>
            </div>
            {equipment.pin && (
              <div className="flex justify-between">
                <span className="text-gray-600">Pin:</span>
                <span className="text-gray-900 font-semibold">{equipment.pin}</span>
              </div>
            )}
            {equipment.minLimit !== null && (
              <div className="flex justify-between">
                <span className="text-gray-600">Min/Max:</span>
                <span className="text-gray-900 font-semibold">
                  {equipment.minLimit} - {equipment.maxLimit}
                </span>
              </div>
            )}
            {equipment.lastStatusAt && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Update:</span>
                <span className="text-gray-900">
                  {new Date(equipment.lastStatusAt).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer - Command History Link */}
      <div className="px-6 py-3 bg-gray-50 border-t">
        <Link
          to={`/equipment/${equipment.id}/commands`}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          📜 View Command History →
        </Link>
      </div>
    </div>
  );
};

export default EquipmentControl;


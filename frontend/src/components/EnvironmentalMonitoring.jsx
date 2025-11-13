import { useState, useEffect } from 'react';
import { 
  Thermometer, Droplets, Wind, Sun, Activity, 
  AlertTriangle, TrendingUp, TrendingDown, Minus,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

export default function EnvironmentalMonitoring({ zoneId, activeRecipe }) {
  const [latestReadings, setLatestReadings] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [averages, setAverages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState('temperature');

  useEffect(() => {
    fetchEnvironmentalData();

    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchEnvironmentalData(true);
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [zoneId, autoRefresh]);

  const fetchEnvironmentalData = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);
      else setRefreshing(true);

      const [latestRes, historyRes, avgRes] = await Promise.all([
        api.get(`/telemetry/zone/${zoneId}/latest`),
        api.get(`/telemetry/zone/${zoneId}/history?hours=24`),
        api.get(`/telemetry/zone/${zoneId}/averages?hours=24`)
      ]);

      setLatestReadings(latestRes.data.data);
      setHistoricalData(historyRes.data.data || []);
      setAverages(avgRes.data.data);
    } catch (error) {
      console.error('Error fetching environmental data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const generateSimulatedData = async () => {
    try {
      setLoading(true);
      await api.post(`/telemetry/zone/${zoneId}/simulate`, {
        hours: 24,
        intervalMinutes: 15
      });
      await fetchEnvironmentalData();
    } catch (error) {
      console.error('Error generating simulated data:', error);
      alert('Failed to generate simulated data');
    }
  };

  const getOptimalRange = (param) => {
    if (!activeRecipe || !activeRecipe.stages || activeRecipe.stages.length === 0) {
      return null;
    }

    const currentStage = activeRecipe.stages[0]; // Use first stage as default
    const value = currentStage[param];

    if (!value) return null;

    if (typeof value === 'number') {
      return { min: value - 2, max: value + 2, optimal: value };
    } else if (value.optimal) {
      return value;
    }

    return null;
  };

  const getStatus = (current, optimal) => {
    if (!current || !optimal) return 'unknown';
    
    const { min, max, optimal: opt } = optimal;
    
    if (current < min) return 'low';
    if (current > max) return 'high';
    if (Math.abs(current - opt) < (max - min) * 0.2) return 'optimal';
    return 'acceptable';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal': return 'text-green-600 bg-green-100';
      case 'acceptable': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal': return <Activity className="w-4 h-4" />;
      case 'low': return <TrendingDown className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const formatChartData = () => {
    return historicalData.map(reading => ({
      time: new Date(reading.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      temperature: reading.temperature,
      humidity: reading.humidity,
      co2: reading.co2,
      light: reading.light
    })).reverse();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading environmental data...</div>
      </div>
    );
  }

  const tempOptimal = getOptimalRange('temperature');
  const humidityOptimal = getOptimalRange('humidity');
  const co2Optimal = getOptimalRange('co2');
  const lightOptimal = getOptimalRange('light');

  const tempStatus = getStatus(latestReadings?.temperature, tempOptimal);
  const humidityStatus = getStatus(latestReadings?.humidity, humidityOptimal);
  const co2Status = getStatus(latestReadings?.co2, co2Optimal);
  const lightStatus = getStatus(latestReadings?.light, lightOptimal);

  const metrics = [
    {
      key: 'temperature',
      name: 'Temperature',
      value: latestReadings?.temperature?.toFixed(1) || '--',
      unit: '°C',
      icon: Thermometer,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      optimal: tempOptimal,
      status: tempStatus,
      average: averages?.temperature?.toFixed(1)
    },
    {
      key: 'humidity',
      name: 'Humidity',
      value: latestReadings?.humidity?.toFixed(1) || '--',
      unit: '%',
      icon: Droplets,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      optimal: humidityOptimal,
      status: humidityStatus,
      average: averages?.humidity?.toFixed(1)
    },
    {
      key: 'co2',
      name: 'CO₂',
      value: latestReadings?.co2?.toFixed(0) || '--',
      unit: 'ppm',
      icon: Wind,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      optimal: co2Optimal,
      status: co2Status,
      average: averages?.co2?.toFixed(0)
    },
    {
      key: 'light',
      name: 'Light',
      value: latestReadings?.light?.toFixed(0) || '--',
      unit: 'lux',
      icon: Sun,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      optimal: lightOptimal,
      status: lightStatus,
      average: averages?.light?.toFixed(0)
    }
  ];

  const hasData = latestReadings && latestReadings.temperature !== null;
  const chartData = formatChartData();

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Environmental Monitoring</h2>
          {latestReadings?.timestamp && (
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {new Date(latestReadings.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => fetchEnvironmentalData(true)}
            disabled={refreshing}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {!hasData && (
            <button
              onClick={generateSimulatedData}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Generate Test Data
            </button>
          )}
        </div>
      </div>

      {!hasData ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Environmental Data</h3>
          <p className="text-gray-600 mb-4">
            No sensor readings have been recorded for this zone yet.
          </p>
          <button
            onClick={generateSimulatedData}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Generate Simulated Data for Testing
          </button>
        </div>
      ) : (
        <>
          {/* Current Readings Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div 
                  key={metric.key}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedMetric(metric.key)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                      <Icon className={`w-6 h-6 ${metric.color}`} />
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(metric.status)}`}>
                      {getStatusIcon(metric.status)}
                      {metric.status}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{metric.name}</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {metric.value}
                    <span className="text-lg font-normal text-gray-600 ml-1">{metric.unit}</span>
                  </div>
                  {metric.optimal && (
                    <div className="mt-2 text-xs text-gray-500">
                      Target: {metric.optimal.optimal}{metric.unit} ({metric.optimal.min}-{metric.optimal.max})
                    </div>
                  )}
                  {metric.average && (
                    <div className="mt-1 text-xs text-gray-500">
                      24h avg: {metric.average}{metric.unit}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Historical Chart */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold mb-4">24-Hour History</h3>
              <div className="mb-4 flex gap-2">
                {metrics.map(metric => (
                  <button
                    key={metric.key}
                    onClick={() => setSelectedMetric(metric.key)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      selectedMetric === metric.key
                        ? `${metric.bgColor} ${metric.color} font-medium`
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {metric.name}
                  </button>
                ))}
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey={selectedMetric} 
                    stroke={
                      selectedMetric === 'temperature' ? '#dc2626' :
                      selectedMetric === 'humidity' ? '#2563eb' :
                      selectedMetric === 'co2' ? '#16a34a' :
                      '#eab308'
                    }
                    strokeWidth={2}
                    name={metrics.find(m => m.key === selectedMetric)?.name}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}


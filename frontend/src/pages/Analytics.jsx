import { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Target, Sprout, Calendar, Download,
  Activity, CheckCircle2, Layers, Package
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../services/api';

export default function Analytics() {
  const [overview, setOverview] = useState(null);
  const [yieldTrends, setYieldTrends] = useState([]);
  const [batchPerformance, setBatchPerformance] = useState([]);
  const [recipePerformance, setRecipePerformance] = useState([]);
  const [qualityDistribution, setQualityDistribution] = useState([]);
  const [recentActivity, setRecentActivity] = useState({ recentHarvests: [], recentBatches: [] });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      const params = {};
      if (dateRange.startDate) params.startDate = dateRange.startDate;
      if (dateRange.endDate) params.endDate = dateRange.endDate;
      
      const [
        overviewRes,
        trendsRes,
        batchPerfRes,
        recipePerfRes,
        qualityRes,
        activityRes
      ] = await Promise.all([
        api.get('/analytics/overview', { params }),
        api.get('/analytics/yield-trends'),
        api.get('/analytics/batch-performance'),
        api.get('/analytics/recipe-performance'),
        api.get('/analytics/quality-distribution'),
        api.get('/analytics/recent-activity')
      ]);

      setOverview(overviewRes.data.data);
      setYieldTrends(trendsRes.data.data);
      setBatchPerformance(batchPerfRes.data.data);
      setRecipePerformance(recipePerfRes.data.data);
      setQualityDistribution(qualityRes.data.data);
      setRecentActivity(activityRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  const qualityColors = {
    premium: '#8b5cf6',
    grade_a: '#10b981',
    grade_b: '#f59e0b',
    rejected: '#ef4444',
    ungraded: '#6b7280'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
          <p className="text-gray-600 mt-1">Track performance, trends, and make data-driven decisions</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-gray-400" />
          <label className="text-sm font-medium text-gray-700">Date Range:</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
          />
          <button
            onClick={() => setDateRange({ startDate: '', endDate: '' })}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Clear Filter
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Zones</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overview?.totalZones || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{overview?.activeBatches || 0} active</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Layers className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Yield</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overview?.totalYield || 0} <span className="text-lg">kg</span></p>
              <p className="text-xs text-gray-500 mt-1">{overview?.totalHarvests || 0} harvests</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Bio-Efficiency</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overview?.avgBioEfficiency || 0}<span className="text-lg">%</span></p>
              <p className="text-xs text-gray-500 mt-1">yield per bag</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed Batches</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{overview?.completedBatches || 0}</p>
              <p className="text-xs text-gray-500 mt-1">{overview?.totalFarms || 0} farms</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield Trends */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Yield Trends</h2>
          </div>
          {yieldTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yieldTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalYield" stroke="#10b981" strokeWidth={2} name="Yield (kg)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No yield data available yet
            </div>
          )}
        </div>

        {/* Quality Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Quality Distribution</h2>
          </div>
          {qualityDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={qualityDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, weight }) => `${grade}: ${weight}kg`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="weight"
                >
                  {qualityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={qualityColors[entry.grade] || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No quality data available yet
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Batch Bio-Efficiency</h2>
          </div>
          {batchPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={batchPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="batchNumber" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="bioEfficiency" fill="#3b82f6" name="Bio-Efficiency (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No batch data available yet
            </div>
          )}
        </div>

        {/* Recipe Performance */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Sprout className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Recipe Performance</h2>
          </div>
          {recipePerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={recipePerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cropName" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgYield" fill="#10b981" name="Avg Yield (kg)" />
                <Bar dataKey="avgBioEfficiency" fill="#f59e0b" name="Avg Bio-Efficiency (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No recipe data available yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Harvests */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Harvests</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.recentHarvests.length > 0 ? (
              recentActivity.recentHarvests.map((harvest) => (
                <div key={harvest.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{harvest.zoneName} - Flush {harvest.flushNumber}</p>
                    <p className="text-sm text-gray-600">{harvest.cropName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{harvest.weight} kg</p>
                    <p className="text-xs text-gray-500">{new Date(harvest.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No recent harvests</p>
            )}
          </div>
        </div>

        {/* Recent Batch Completions */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Recent Completions</h2>
          </div>
          <div className="space-y-3">
            {recentActivity.recentBatches.length > 0 ? (
              recentActivity.recentBatches.map((batch) => (
                <div key={batch.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{batch.batchNumber}</p>
                    <p className="text-sm text-gray-600">{batch.zoneName} - {batch.cropName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{batch.totalYield} kg</p>
                    <p className="text-xs text-gray-500">{batch.duration} days</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No completed batches yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

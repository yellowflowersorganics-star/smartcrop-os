import { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import { TrendingUp, TrendingDown, Award, DollarSign } from 'lucide-react';

/**
 * Harvest Analytics Charts Component
 * Displays yield trends, quality distribution, BE%, and revenue analytics
 */
const HarvestCharts = ({ harvests = [], batches = [] }) => {
  // Quality grade colors
  const QUALITY_COLORS = {
    premium: '#10b981', // green-500
    grade_a: '#3b82f6',  // blue-500
    grade_b: '#f59e0b',  // yellow-500
    rejected: '#ef4444'  // red-500
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!harvests || harvests.length === 0) {
      return {
        totalYield: 0,
        avgBE: 0,
        totalRevenue: 0,
        avgQualityScore: 0
      };
    }

    const totalYield = harvests.reduce((sum, h) => sum + (h.totalWeightKg || 0), 0);
    const beValues = harvests.filter(h => h.biologicalEfficiency).map(h => h.biologicalEfficiency);
    const avgBE = beValues.length > 0 ? beValues.reduce((a, b) => a + b, 0) / beValues.length : 0;
    const totalRevenue = harvests.reduce((sum, h) => sum + (h.totalRevenue || 0), 0);
    
    // Quality score: Premium=100, A=80, B=60, Rejected=0
    const qualityScores = {
      premium: 100,
      grade_a: 80,
      grade_b: 60,
      rejected: 0
    };
    const totalScore = harvests.reduce((sum, h) => {
      return sum + (qualityScores[h.qualityGrade] || 0);
    }, 0);
    const avgQualityScore = totalScore / harvests.length;

    return {
      totalYield: totalYield.toFixed(1),
      avgBE: avgBE.toFixed(1),
      totalRevenue: totalRevenue.toFixed(0),
      avgQualityScore: avgQualityScore.toFixed(0)
    };
  }, [harvests]);

  // Prepare yield trend data
  const yieldTrendData = useMemo(() => {
    if (!harvests || harvests.length === 0) return [];

    const sorted = [...harvests].sort((a, b) => 
      new Date(a.harvestDate) - new Date(b.harvestDate)
    );

    return sorted.map(harvest => ({
      date: new Date(harvest.harvestDate).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      yield: harvest.totalWeightKg,
      be: harvest.biologicalEfficiency || 0,
      revenue: harvest.totalRevenue || 0,
      flush: harvest.flushNumber
    }));
  }, [harvests]);

  // Prepare quality distribution data
  const qualityDistData = useMemo(() => {
    if (!harvests || harvests.length === 0) return [];

    const distribution = {
      premium: 0,
      grade_a: 0,
      grade_b: 0,
      rejected: 0
    };

    harvests.forEach(harvest => {
      if (harvest.qualityGrade) {
        distribution[harvest.qualityGrade] += harvest.totalWeightKg || 0;
      }
    });

    return Object.entries(distribution)
      .filter(([_, weight]) => weight > 0)
      .map(([grade, weight]) => ({
        name: grade.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        value: weight,
        percentage: ((weight / stats.totalYield) * 100).toFixed(1)
      }));
  }, [harvests, stats.totalYield]);

  // Prepare batch comparison data
  const batchComparisonData = useMemo(() => {
    if (!batches || batches.length === 0) return [];

    return batches.map(batch => ({
      batchId: batch.batchId.slice(-6), // Last 6 chars
      yield: batch.totalYieldKg,
      be: batch.avgBiologicalEfficiency,
      quality: batch.avgQualityScore || 0
    }));
  }, [batches]);

  // Prepare flush comparison data
  const flushComparisonData = useMemo(() => {
    if (!harvests || harvests.length === 0) return [];

    const flushes = {};
    
    harvests.forEach(harvest => {
      const flush = harvest.flushNumber;
      if (!flushes[flush]) {
        flushes[flush] = { count: 0, totalYield: 0, totalBE: 0 };
      }
      flushes[flush].count++;
      flushes[flush].totalYield += harvest.totalWeightKg || 0;
      flushes[flush].totalBE += harvest.biologicalEfficiency || 0;
    });

    return Object.entries(flushes).map(([flush, data]) => ({
      flush: `Flush ${flush}`,
      avgYield: (data.totalYield / data.count).toFixed(1),
      avgBE: (data.totalBE / data.count).toFixed(1),
      count: data.count
    }));
  }, [harvests]);

  if (!harvests || harvests.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No harvest data available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Yield</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalYield} kg</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg BE%</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgBE}%</p>
            </div>
            <div className={`p-3 rounded-full ${
              stats.avgBE >= 20 ? 'bg-green-100' : 'bg-yellow-100'
            }`}>
              {stats.avgBE >= 20 ? (
                <TrendingUp className="w-6 h-6 text-green-600" />
              ) : (
                <TrendingDown className="w-6 h-6 text-yellow-600" />
              )}
            </div>
          </div>
          <p className={`text-sm mt-2 ${
            stats.avgBE >= 20 ? 'text-green-600' : 'text-yellow-600'
          }`}>
            Target: 20-25%
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Quality</p>
              <p className="text-3xl font-bold text-gray-900">{stats.avgQualityScore}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">₹{stats.totalRevenue}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Yield Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Yield Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={yieldTrendData}>
            <defs>
              <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis label={{ value: 'Yield (kg)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="yield" 
              stroke="#10b981" 
              fillOpacity={1} 
              fill="url(#colorYield)" 
              name="Yield (kg)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Two columns: BE% and Quality Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Biological Efficiency Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Biological Efficiency</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yieldTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis label={{ value: 'BE%', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="be" fill="#3b82f6" name="BE%" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Target:</strong> 20-25% BE for optimal performance
            </p>
          </div>
        </div>

        {/* Quality Distribution Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={qualityDistData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: ${entry.percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {qualityDistData.map((entry, index) => {
                  const grade = entry.name.toLowerCase().replace(' ', '_');
                  return <Cell key={`cell-${index}`} fill={QUALITY_COLORS[grade] || '#gray'} />;
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {qualityDistData.map((item, index) => {
              const grade = item.name.toLowerCase().replace(' ', '_');
              return (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: QUALITY_COLORS[grade] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value} kg ({item.percentage}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Flush Comparison */}
      {flushComparisonData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Flush Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={flushComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="flush" />
              <YAxis yAxisId="left" orientation="left" label={{ value: 'Yield (kg)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'BE%', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="avgYield" fill="#10b981" name="Avg Yield (kg)" />
              <Bar yAxisId="right" dataKey="avgBE" fill="#3b82f6" name="Avg BE%" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Insight:</strong> Second flush typically yields 50-70% of first flush. 
              Values above 70% indicate excellent substrate quality.
            </p>
          </div>
        </div>
      )}

      {/* Batch Comparison */}
      {batchComparisonData.length > 1 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Batch Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={batchComparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batchId" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="yield" stroke="#10b981" strokeWidth={2} name="Yield (kg)" />
              <Line type="monotone" dataKey="be" stroke="#3b82f6" strokeWidth={2} name="BE%" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default HarvestCharts;


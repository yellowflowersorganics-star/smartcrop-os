import { useState, useEffect } from 'react';
import { qualityControlService } from '../services/api';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const QualityDashboard = () => {
  const [stats, setStats] = useState(null);
  const [defectAnalysis, setDefectAnalysis] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { days: dateRange };
      
      const [statsRes, defectsRes, complianceRes] = await Promise.all([
        qualityControlService.getStats(params),
        qualityControlService.getDefectAnalysis(params),
        qualityControlService.getCompliance(params)
      ]);

      setStats(statsRes.data);
      setDefectAnalysis(defectsRes.data);
      setCompliance(complianceRes.data);
    } catch (error) {
      console.error('Error fetching quality data:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const passRate = stats?.totalChecks > 0 
    ? ((stats.passedChecks / stats.totalChecks) * 100).toFixed(1) 
    : 0;

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Control</h1>
          <p className="text-gray-600 mt-1">Monitor quality checks, defects, and compliance</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <Link
            to="/quality/inspection"
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Inspection
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inspections</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalChecks || 0}</p>
            </div>
            <ClipboardCheck className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pass Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{passRate}%</p>
            </div>
            <CheckCircle2 className="w-12 h-12 text-green-500 opacity-20" />
          </div>
          <div className="flex items-center gap-1 mt-2">
            {parseFloat(passRate) >= 95 ? (
              <>
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Excellent</span>
              </>
            ) : parseFloat(passRate) >= 85 ? (
              <>
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-600">Good</span>
              </>
            ) : (
              <>
                <TrendingDown className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">Needs Improvement</span>
              </>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Defects</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalDefects || 0}</p>
            </div>
            <AlertTriangle className="w-12 h-12 text-red-500 opacity-20" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats?.criticalDefects || 0} critical
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Review</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats?.pendingChecks || 0}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Inspection Results</h3>
          {stats?.byStatus?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.byStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="status"
                >
                  {stats.byStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Defects by Type */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Defects by Type</h3>
          {defectAnalysis?.byType?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={defectAnalysis.byType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#ef4444" name="Defects" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No defects recorded
            </div>
          )}
        </div>
      </div>

      {/* Defects by Severity */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Defects by Severity</h3>
        {defectAnalysis?.bySeverity?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {defectAnalysis.bySeverity.map((item) => (
              <div
                key={item.severity}
                className={`p-4 rounded-lg border-l-4 ${
                  item.severity === 'critical'
                    ? 'border-red-600 bg-red-50'
                    : item.severity === 'major'
                    ? 'border-orange-500 bg-orange-50'
                    : item.severity === 'minor'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-400 bg-gray-50'
                }`}
              >
                <p className="text-sm font-medium text-gray-600 capitalize">{item.severity}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{item.count}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500 text-center py-4">No defects recorded</div>
        )}
      </div>

      {/* Compliance Overview */}
      {compliance && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Compliance Report</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Overall Compliance Rate</p>
                <p className="text-sm text-gray-600 mt-1">
                  {compliance.totalStandards} standards monitored
                </p>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {compliance.overallCompliance}%
              </div>
            </div>

            {compliance.byStandard?.length > 0 && (
              <div className="space-y-2">
                {compliance.byStandard.map((std) => (
                  <div key={std.standardId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">{std.standardName}</p>
                      <p className="text-xs text-gray-600">{std.checkCount} inspections</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            std.complianceRate >= 95
                              ? 'bg-green-600'
                              : std.complianceRate >= 85
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${std.complianceRate}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">
                        {std.complianceRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/quality/inspection"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center gap-4">
            <ClipboardCheck className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="font-semibold text-gray-900">New Inspection</h4>
              <p className="text-sm text-gray-600">Perform quality check</p>
            </div>
          </div>
        </Link>

        <Link
          to="/quality/checks"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-blue-500"
        >
          <div className="flex items-center gap-4">
            <Eye className="w-8 h-8 text-blue-600" />
            <div>
              <h4 className="font-semibold text-gray-900">View All Checks</h4>
              <p className="text-sm text-gray-600">Browse inspection history</p>
            </div>
          </div>
        </Link>

        <Link
          to="/quality/standards"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
        >
          <div className="flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Manage Standards</h4>
              <p className="text-sm text-gray-600">Quality criteria & rules</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default QualityDashboard;


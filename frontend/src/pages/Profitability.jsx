import { useState, useEffect } from 'react';
import { profitabilityService, costService, revenueService } from '../services/api';
import { 
  TrendingUp, DollarSign, PieChart, BarChart3,
  TrendingDown, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { LineChart, Line, PieChart as RechartsPie, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Profitability() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [trends, setTrends] = useState([]);
  const [costBreakdown, setCostBreakdown] = useState([]);
  const [revenueBreakdown, setRevenueBreakdown] = useState([]);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      const params = {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      };

      const [metricsRes, trendsRes, costBreakdownRes, revenueBreakdownRes] = await Promise.all([
        profitabilityService.getOverall(params),
        profitabilityService.getTrends(params),
        profitabilityService.getCostBreakdown(params),
        profitabilityService.getRevenueBreakdown(params)
      ]);

      setMetrics(metricsRes.data);
      setTrends(trendsRes.data || []);
      setCostBreakdown(costBreakdownRes.data || []);
      setRevenueBreakdown(revenueBreakdownRes.data || []);
    } catch (error) {
      console.error('Error fetching profitability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (value) => {
    const num = parseFloat(value || 0);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const isProfit = parseFloat(metrics?.grossProfit || 0) >= 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profitability Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Financial overview and profit analysis
          </p>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="180">Last 6 months</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue)}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(metrics?.totalExpenses)}
          icon={<TrendingDown className="w-6 h-6" />}
          color="bg-red-500"
          subtitle={`Costs: ${formatCurrency(metrics?.totalCosts)} + Labor: ${formatCurrency(metrics?.totalLaborCosts)}`}
        />
        <MetricCard
          title="Gross Profit"
          value={formatCurrency(metrics?.grossProfit)}
          icon={isProfit ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />}
          color={isProfit ? 'bg-green-500' : 'bg-red-500'}
        />
        <MetricCard
          title="Profit Margin"
          value={formatPercentage(metrics?.profitMargin)}
          icon={<PieChart className="w-6 h-6" />}
          color={parseFloat(metrics?.profitMargin || 0) >= 0 ? 'bg-green-500' : 'bg-red-500'}
          subtitle={`ROI: ${formatPercentage(metrics?.roi)}`}
        />
      </div>

      {/* Profit Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Profit Trend</h2>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>Expenses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Profit</span>
            </div>
          </div>
        </div>

        {trends.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" strokeWidth={2} />
              <Line type="monotone" dataKey="totalExpenses" stroke="#ef4444" name="Expenses" strokeWidth={2} />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-gray-500">
            No trend data available for the selected period
          </div>
        )}
      </div>

      {/* Cost & Revenue Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cost Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Cost Breakdown</h2>
          
          {costBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={costBreakdown}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => `${entry.category}: ₹${parseFloat(entry.total).toFixed(0)}`}
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </RechartsPie>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {costBreakdown.slice(0, 5).map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <span className="text-gray-700 capitalize">{item.category.replace('_', ' ')}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(item.total)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No cost data available
            </div>
          )}
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Revenue Breakdown</h2>
          
          {revenueBreakdown.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>

              <div className="mt-4 space-y-2">
                {revenueBreakdown.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 capitalize">{item.type.replace('_', ' ')}</span>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(item.total)}</div>
                      <div className="text-xs text-gray-500">{item.quantity} {item.quantity > 1 ? 'kg' : 'kg'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No revenue data available
            </div>
          )}
        </div>
      </div>

      {/* Quick Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Financial Insights</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Track costs daily to maintain accurate profitability metrics</li>
          <li>• Monitor profit margins closely - aim for 20-30% for healthy operations</li>
          <li>• Use batch profitability to identify most profitable growing recipes</li>
          <li>• Review labor costs regularly to optimize workforce efficiency</li>
        </ul>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color, subtitle }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color} text-white`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
      )}
    </div>
  );
}


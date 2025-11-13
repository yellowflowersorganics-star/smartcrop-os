import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, TrendingUp, Leaf, Sprout, Target, CheckCircle2,
  Calendar, Package, ArrowRight, AlertTriangle, X
} from 'lucide-react';
import api, { inventoryService } from '../services/api';

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [recentActivity, setRecentActivity] = useState({ recentHarvests: [], recentBatches: [] });
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockAlert, setShowLowStockAlert] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [overviewRes, activityRes, lowStockRes] = await Promise.all([
        api.get('/analytics/overview'),
        api.get('/analytics/recent-activity'),
        inventoryService.getLowStock().catch(() => ({ data: [] }))
      ]);
      setOverview(overviewRes.data.data);
      setRecentActivity(activityRes.data.data);
      setLowStockItems(lowStockRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const stats = [
    { 
      name: 'Total Zones', 
      value: overview?.totalZones || 0, 
      subtitle: `${overview?.activeBatches || 0} active`,
      icon: Leaf, 
      color: 'bg-blue-500',
      link: '/zones'
    },
    { 
      name: 'Total Yield', 
      value: `${overview?.totalYield || 0} kg`, 
      subtitle: `${overview?.totalHarvests || 0} harvests`,
      icon: Sprout, 
      color: 'bg-green-500',
      link: '/analytics'
    },
    { 
      name: 'Bio-Efficiency', 
      value: `${overview?.avgBioEfficiency || 0}%`, 
      subtitle: 'average yield/bag',
      icon: Target, 
      color: 'bg-purple-500',
      link: '/analytics'
    },
    { 
      name: 'Completed Batches', 
      value: overview?.completedBatches || 0, 
      subtitle: `${overview?.totalFarms || 0} farms`,
      icon: CheckCircle2, 
      color: 'bg-green-600',
      link: '/analytics'
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to <span className="whitespace-nowrap">SmartCrop OS</span> - Monitor your mushroom cultivation
        </p>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && showLowStockAlert && (
        <div className="mb-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-orange-800">
                Low Stock Alert - {lowStockItems.length} item{lowStockItems.length !== 1 ? 's' : ''} running low
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <ul className="list-disc list-inside space-y-1">
                  {lowStockItems.slice(0, 3).map(item => (
                    <li key={item.id}>
                      <span className="font-medium">{item.name}</span> - 
                      {' '}{item.currentStock} {item.unit} remaining 
                      (min: {item.minStockLevel} {item.unit})
                    </li>
                  ))}
                  {lowStockItems.length > 3 && (
                    <li className="font-medium">
                      ...and {lowStockItems.length - 3} more
                    </li>
                  )}
                </ul>
              </div>
              <div className="mt-3">
                <Link 
                  to="/inventory?lowStock=true"
                  className="text-sm font-medium text-orange-800 hover:text-orange-900 underline"
                >
                  View all low stock items →
                </Link>
              </div>
            </div>
            <button
              onClick={() => setShowLowStockAlert(false)}
              className="ml-3 flex-shrink-0 text-orange-500 hover:text-orange-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.name} to={stat.link} className="block">
              <div className="card hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.name}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Harvests */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Harvests</h2>
            <Link to="/analytics" className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.recentHarvests.length > 0 ? (
              recentActivity.recentHarvests.map((harvest) => (
                <div key={harvest.id} className="flex items-center py-3 border-b last:border-0">
                  <div className="bg-green-100 p-2 rounded-lg mr-4">
                    <Package className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{harvest.zoneName} - Flush {harvest.flushNumber}</p>
                    <p className="text-sm text-gray-500">{harvest.cropName} - {harvest.weight} kg</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {getTimeAgo(harvest.date)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No harvests recorded yet</p>
                <Link to="/zones" className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block">
                  Start a batch →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Batch Completions */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Completions</h2>
            <Link to="/analytics" className="text-green-600 hover:text-green-700 text-sm flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {recentActivity.recentBatches.length > 0 ? (
              recentActivity.recentBatches.map((batch) => (
                <div key={batch.id} className="flex items-center py-3 border-b last:border-0">
                  <div className="bg-blue-100 p-2 rounded-lg mr-4">
                    <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{batch.batchNumber}</p>
                    <p className="text-sm text-gray-500">{batch.zoneName} - {batch.totalYield} kg in {batch.duration} days</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {getTimeAgo(batch.completedDate)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-30" />
                <p>No completed batches yet</p>
                <Link to="/zones" className="text-green-600 hover:text-green-700 text-sm mt-2 inline-block">
                  Start a batch →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-100">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/farms" className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors">
            <Activity className="w-5 h-5" />
            <span>Manage Farms</span>
          </Link>
          <Link to="/zones" className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors">
            <Leaf className="w-5 h-5" />
            <span>View Zones</span>
          </Link>
          <Link to="/recipes" className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors">
            <Sprout className="w-5 h-5" />
            <span>Growing Recipes</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors">
            <TrendingUp className="w-5 h-5" />
            <span>View Analytics</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


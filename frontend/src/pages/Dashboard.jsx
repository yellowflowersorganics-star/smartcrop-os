import { useQuery } from '@tanstack/react-query';
import { farmService } from '../services/api';
import { Activity, TrendingUp, AlertCircle, Leaf } from 'lucide-react';

export default function Dashboard() {
  const { data: farms } = useQuery({
    queryKey: ['farms'],
    queryFn: () => farmService.getAll().then(res => res.data.data),
  });

  const stats = [
    { name: 'Total Farms', value: farms?.length || 0, icon: Activity, color: 'bg-blue-500' },
    { name: 'Active Zones', value: '12', icon: Leaf, color: 'bg-green-500' },
    { name: 'Yield This Month', value: '245kg', icon: TrendingUp, color: 'bg-purple-500' },
    { name: 'Active Alerts', value: '3', icon: AlertCircle, color: 'bg-orange-500' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to SmartCrop OS</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center py-3 border-b">
            <div className="bg-green-100 p-2 rounded-lg mr-4">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">New batch started in Zone A</p>
              <p className="text-sm text-gray-500">Cherry Tomato - 2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center py-3 border-b">
            <div className="bg-blue-100 p-2 rounded-lg mr-4">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Device ESP32_A01 came online</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center py-3">
            <div className="bg-purple-100 p-2 rounded-lg mr-4">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">Yield target achieved in Zone B</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Box, 
  BookOpen,
  Package,
  CheckSquare,
  Clock,
  DollarSign,
  TrendingUp,
  Cpu, 
  BarChart3, 
  Settings,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import NotificationBell from '../components/NotificationBell';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Farms', href: '/farms', icon: Building2 },
  { name: 'Zones', href: '/zones', icon: Box },
  { name: 'Growing Recipes', href: '/recipes', icon: BookOpen },
  { name: 'Inventory', href: '/inventory', icon: Package },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Labor', href: '/labor', icon: Clock },
  { name: 'Costs', href: '/costs', icon: DollarSign },
  { name: 'Profitability', href: '/profitability', icon: TrendingUp },
  { name: 'Devices', href: '/devices', icon: Cpu },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-primary-800 text-white flex flex-col">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">🌱 SmartCrop OS</h1>
            <p className="text-sm text-primary-200 mt-1">Multi-Crop Platform</p>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-primary-700">
          <div className="flex items-center px-4 py-2">
            <div className="flex-1">
              <p className="font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-primary-200">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center px-4 py-2 mt-2 rounded-md text-primary-100 hover:bg-primary-700 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}


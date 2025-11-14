import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Box, 
  BookOpen,
  Package,
  CheckSquare,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  ClipboardCheck,
  FileText,
  Cpu, 
  BarChart3, 
  Settings,
  LogOut,
  Menu,
  X
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
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Labor', href: '/labor', icon: Clock },
  { name: 'Costs', href: '/costs', icon: DollarSign },
  { name: 'Profitability', href: '/profitability', icon: TrendingUp },
  { name: 'Quality Control', href: '/quality', icon: ClipboardCheck },
  { name: 'SOP Management', href: '/sop', icon: FileText },
  { name: 'Devices', href: '/devices', icon: Cpu },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function MainLayout() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-primary-800 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 animate-fade-in"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-primary-800 text-white flex flex-col
        fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold whitespace-nowrap">🌱 SmartCrop</h1>
            <p className="text-sm text-primary-200 mt-1 whitespace-nowrap">Multi-Crop Platform</p>
          </div>
          <NotificationBell />
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive
                    ? 'bg-primary-700 text-white'
                    : 'text-primary-100 hover:bg-primary-700'
                }`}
              >
                <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
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
      <div className="flex-1 overflow-auto lg:ml-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}


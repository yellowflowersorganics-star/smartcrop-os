import { useState, useEffect } from 'react';
import { laborService } from '../services/api';
import { 
  Clock, Play, Square, Coffee, Calendar, DollarSign,
  CheckCircle2, XCircle, Filter, Plus, Edit2, Trash2
} from 'lucide-react';

const CATEGORIES = [
  { value: 'monitoring', label: 'Monitoring' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'harvesting', label: 'Harvesting' },
  { value: 'inoculation', label: 'Inoculation' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'packing', label: 'Packing' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'administrative', label: 'Administrative' },
  { value: 'other', label: 'Other' }
];

export default function Labor() {
  const [activeShift, setActiveShift] = useState(null);
  const [workLogs, setWorkLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockInLoading, setClockInLoading] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shiftRes, logsRes, statsRes] = await Promise.all([
        laborService.getCurrentShift(),
        laborService.getMy({ status: filterStatus || undefined }),
        laborService.getStats({})
      ]);

      setActiveShift(shiftRes.data.data);
      setWorkLogs(logsRes.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching labor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClockIn = async () => {
    try {
      setClockInLoading(true);
      await laborService.clockIn({
        category: 'other',
        description: 'Work shift started'
      });
      await fetchData();
    } catch (error) {
      console.error('Error clocking in:', error);
      alert(error.response?.data?.error || 'Failed to clock in');
    } finally {
      setClockInLoading(false);
    }
  };

  const handleClockOut = async () => {
    if (!confirm('Clock out from current shift?')) return;

    try {
      setClockInLoading(true);
      await laborService.clockOut({
        breakMinutes: 0
      });
      await fetchData();
    } catch (error) {
      console.error('Error clocking out:', error);
      alert(error.response?.data?.error || 'Failed to clock out');
    } finally {
      setClockInLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getShiftDuration = () => {
    if (!activeShift?.clockIn) return '0h 0m';
    const start = new Date(activeShift.clockIn);
    const diffMs = currentTime - start;
    const diffMins = Math.floor(diffMs / 60000);
    return formatDuration(diffMins);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Labor Tracking</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track work hours and labor costs
          </p>
        </div>
        <button
          onClick={() => setShowManualEntry(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Manual Entry
        </button>
      </div>

      {/* Clock In/Out Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-2">Current Time</p>
            <p className="text-4xl font-bold">
              {currentTime.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
              })}
            </p>
            <p className="text-sm opacity-75 mt-1">
              {currentTime.toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {activeShift ? (
            <div className="text-right">
              <div className="bg-white bg-opacity-20 rounded-lg px-6 py-4 mb-4">
                <p className="text-sm opacity-90 mb-1">Shift Duration</p>
                <p className="text-3xl font-bold">{getShiftDuration()}</p>
                <p className="text-xs opacity-75 mt-1">
                  Started at {formatTime(activeShift.clockIn)}
                </p>
              </div>
              <button
                onClick={handleClockOut}
                disabled={clockInLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                <Square className="w-5 h-5" />
                Clock Out
              </button>
            </div>
          ) : (
            <button
              onClick={handleClockIn}
              disabled={clockInLoading}
              className="flex items-center gap-2 px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-semibold text-lg"
            >
              <Play className="w-6 h-6" />
              Clock In
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalHours}h</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalCost)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Active Shifts</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {/* Work Logs List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Work History</h2>
        </div>

        {workLogs.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No work logs found</h3>
            <p className="text-gray-600">Clock in to start tracking your work hours</p>
          </div>
        ) : (
          <div className="divide-y">
            {workLogs.map(log => (
              <WorkLogCard key={log.id} log={log} onRefresh={fetchData} />
            ))}
          </div>
        )}
      </div>

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <ManualEntryModal
          onClose={() => setShowManualEntry(false)}
          onSuccess={() => {
            setShowManualEntry(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function WorkLogCard({ log, onRefresh }) {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toFixed(2)}`;
  };

  const statusColors = {
    active: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    approved: 'bg-purple-100 text-purple-700',
    rejected: 'bg-red-100 text-red-700'
  };

  return (
    <div className="p-6 hover:bg-gray-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-gray-900">
              {formatDate(log.workDate)}
            </span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[log.status]}`}>
              {log.status}
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {log.category.replace('_', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTime(log.clockIn)} - {log.clockOut ? formatTime(log.clockOut) : 'Active'}
            </span>
            
            {log.totalHours && (
              <span className="flex items-center gap-1">
                <Coffee className="w-4 h-4" />
                {log.totalHours}h
                {log.breakMinutes > 0 && ` (Break: ${log.breakMinutes}m)`}
              </span>
            )}

            {log.totalCost && (
              <span className="flex items-center gap-1 font-medium text-green-600">
                <DollarSign className="w-4 h-4" />
                {formatCurrency(log.totalCost)}
              </span>
            )}
          </div>

          {log.description && (
            <p className="text-sm text-gray-600 mt-2">{log.description}</p>
          )}

          {log.zone && (
            <p className="text-xs text-gray-500 mt-2">Zone: {log.zone.name}</p>
          )}
        </div>

        {log.status === 'active' && (
          <div className="flex items-center gap-2">
            <div className="animate-pulse flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-medium">In Progress</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ManualEntryModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    workDate: new Date().toISOString().split('T')[0],
    clockIn: '',
    clockOut: '',
    breakMinutes: 0,
    hourlyRate: '',
    category: 'other',
    description: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // Convert times to full datetime
      const clockInDateTime = new Date(`${formData.workDate}T${formData.clockIn}`);
      const clockOutDateTime = formData.clockOut 
        ? new Date(`${formData.workDate}T${formData.clockOut}`)
        : null;

      await laborService.create({
        ...formData,
        clockIn: clockInDateTime.toISOString(),
        clockOut: clockOutDateTime?.toISOString() || null,
        userId: undefined // Will be set by backend from auth
      });

      onSuccess();
    } catch (error) {
      console.error('Error creating work log:', error);
      setError(error.response?.data?.error || 'Failed to create work log');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Manual Work Entry</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Work Date *
            </label>
            <input
              type="date"
              required
              value={formData.workDate}
              onChange={(e) => setFormData({ ...formData, workDate: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clock In Time *
              </label>
              <input
                type="time"
                required
                value={formData.clockIn}
                onChange={(e) => setFormData({ ...formData, clockIn: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clock Out Time
              </label>
              <input
                type="time"
                value={formData.clockOut}
                onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Break (minutes)
              </label>
              <input
                type="number"
                min="0"
                value={formData.breakMinutes}
                onChange={(e) => setFormData({ ...formData, breakMinutes: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Optional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              rows="3"
              placeholder="Add details about the work performed..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Work Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


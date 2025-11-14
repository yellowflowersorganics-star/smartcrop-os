import { useState, useEffect } from 'react';
import { notificationService } from '../services/api';
import { 
  Bell, AlertCircle, AlertTriangle, Info, Check, X, 
  CheckCircle2, Filter, Calendar, ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

const SEVERITY_COLORS = {
  low: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  critical: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' }
};

const SEVERITY_ICONS = {
  low: Info,
  medium: AlertCircle,
  high: AlertTriangle,
  critical: AlertCircle
};

const TYPE_LABELS = {
  environmental: 'Environmental',
  batch_milestone: 'Batch Milestone',
  inventory: 'Inventory',
  equipment: 'Equipment',
  system: 'System',
  harvest_reminder: 'Harvest Reminder',
  task: 'Task',
  success: 'Success',
  warning: 'Warning',
  error: 'Error'
};

export default function Notifications() {
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dismissAllDialog, setDismissAllDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotifications();
  }, [filterType, filterSeverity, filterStatus, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        type: filterType || undefined,
        severity: filterSeverity || undefined,
        status: filterStatus || undefined
      };

      const response = await notificationService.getAll(params);
      setNotifications(response.data.alerts || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, status: 'read' } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDismiss = async (id) => {
    try {
      await notificationService.dismiss(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error dismissing notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDismissAll = async () => {
    try {
      await notificationService.dismissAll();
      toast.success('All read notifications dismissed!');
      fetchNotifications();
    } catch (error) {
      console.error('Error dismissing all:', error);
      toast.error('Failed to dismiss notifications');
    } finally {
      setDismissAllDialog(false);
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-600 mt-1">
            {unreadCount > 0 && `${unreadCount} unread notifications`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50"
            >
              <Check className="w-4 h-4 inline mr-2" />
              Mark All Read
            </button>
          )}
          <button
            onClick={() => setDismissAllDialog(true)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Dismiss All Read
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <select
            value={filterSeverity}
            onChange={(e) => {
              setFilterSeverity(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
            <option value="dismissed">Dismissed</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filterType || filterSeverity || filterStatus
              ? 'No notifications match your filters'
              : "You're all caught up!"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => {
            const severity = SEVERITY_COLORS[notification.severity] || SEVERITY_COLORS.medium;
            const SeverityIcon = SEVERITY_ICONS[notification.severity] || Info;
            const isUnread = notification.status === 'unread';

            return (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${severity.border} ${
                  isUnread ? 'ring-2 ring-blue-100' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Severity Icon */}
                    <div className={`flex-shrink-0 p-3 rounded-full ${severity.bg}`}>
                      <SeverityIcon className={`w-6 h-6 ${severity.text}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-lg font-semibold text-gray-900 ${isUnread ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h3>
                          {isUnread && (
                            <span className="px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${severity.bg} ${severity.text}`}>
                          {notification.severity.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{notification.message}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {TYPE_LABELS[notification.type]}
                        </span>
                        {notification.zone && (
                          <span className="text-gray-600">
                            Zone: {notification.zone.name}
                          </span>
                        )}
                      </div>

                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="inline-flex items-center mt-3 text-sm font-medium text-green-600 hover:text-green-700"
                        >
                          {notification.actionLabel || 'View Details'} →
                        </a>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {isUnread && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Mark as read"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Dismiss"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Dismiss All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dismissAllDialog}
        onClose={() => setDismissAllDialog(false)}
        onConfirm={handleDismissAll}
        title="Dismiss All Read Notifications"
        message="Are you sure you want to dismiss all read notifications? This action cannot be undone."
        confirmText="Dismiss All"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  );
}


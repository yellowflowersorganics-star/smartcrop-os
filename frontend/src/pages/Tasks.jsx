import { useState, useEffect } from 'react';
import { taskService, employeeService, roleService } from '../services/api';
import { 
  CheckSquare, Plus, Filter, Calendar, Clock, AlertCircle,
  CheckCircle2, Play, X, Edit2, Trash2, MoreVertical, Flag, Users
} from 'lucide-react';
import { useToast } from '../components/ToastContainer';
import ConfirmDialog from '../components/ConfirmDialog';

const CATEGORIES = [
  { value: 'monitoring', label: 'Monitoring', icon: '👁️' },
  { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
  { value: 'watering', label: 'Watering', icon: '💧' },
  { value: 'harvesting', label: 'Harvesting', icon: '🌾' },
  { value: 'inoculation', label: 'Inoculation', icon: '🍄' },
  { value: 'cleaning', label: 'Cleaning', icon: '🧹' },
  { value: 'inspection', label: 'Inspection', icon: '🔍' },
  { value: 'inventory', label: 'Inventory', icon: '📦' },
  { value: 'setup', label: 'Setup', icon: '⚙️' },
  { value: 'documentation', label: 'Documentation', icon: '📝' },
  { value: 'other', label: 'Other', icon: '📌' }
];

const PRIORITY_COLORS = {
  low: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  medium: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
  urgent: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' }
};

const STATUS_COLORS = {
  pending: { bg: 'bg-gray-100', text: 'text-gray-700' },
  in_progress: { bg: 'bg-blue-100', text: 'text-blue-700' },
  completed: { bg: 'bg-green-100', text: 'text-green-700' },
  cancelled: { bg: 'bg-gray-300', text: 'text-gray-600' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700' }
};

export default function Tasks() {
  const toast = useToast();
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, taskId: null });
  const [filterPriority, setFilterPriority] = useState('');
  const [viewMode, setViewMode] = useState('list'); // list or calendar
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterCategory, filterPriority]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        status: filterStatus || undefined,
        category: filterCategory || undefined,
        priority: filterPriority || undefined
      };

      const [tasksRes, statsRes, employeesRes, rolesRes] = await Promise.all([
        taskService.getAll(params),
        taskService.getStats(),
        employeeService.getAll({ status: 'active' }),
        roleService.getAll({ includeSystem: true })
      ]);

      setTasks(tasksRes.data.tasks || []);
      setStats(statsRes.data);
      setEmployees(employeesRes.data.employees || []);
      setRoles(rolesRes.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      fetchData();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.complete(taskId, {
        completionNotes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async () => {
    try {
      await taskService.delete(deleteDialog.taskId);
      toast.success('Task deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    } finally {
      setDeleteDialog({ isOpen: false, taskId: null });
    }
  };

  const formatDueDate = (date, time) => {
    if (!date) return 'No due date';
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let dateStr = '';
    if (d.toDateString() === today.toDateString()) {
      dateStr = 'Today';
    } else if (d.toDateString() === tomorrow.toDateString()) {
      dateStr = 'Tomorrow';
    } else {
      dateStr = d.toLocaleDateString();
    }

    return time ? `${dateStr} at ${time}` : dateStr;
  };

  const getCategoryIcon = (category) => {
    return CATEGORIES.find(c => c.value === category)?.icon || '📌';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management</h1>
          <p className="text-sm text-gray-600 mt-1">
            Organize and track your daily operations
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
          Create Task
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Total Tasks</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Pending</p>
            <p className="text-2xl font-bold text-gray-700 mt-1">{stats.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">{stats.inProgress}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Completed</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.completed}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-600">Overdue</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdue}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="w-5 h-5 text-gray-400" />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.icon} {cat.label}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg ${
                viewMode === 'list'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <CheckSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-lg ${
                viewMode === 'calendar'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-6">
            {filterStatus || filterCategory || filterPriority
              ? 'Try adjusting your filters'
              : 'Get started by creating your first task'}
          </p>
          {!filterStatus && !filterCategory && !filterPriority && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Create First Task
            </button>
          )}
        </div>
      ) : viewMode === 'list' ? (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onComplete={handleCompleteTask}
              onEdit={() => {
                setSelectedTask(task);
                setShowEditModal(true);
              }}
              onDelete={(id) => setDeleteDialog({ isOpen: true, taskId: id })}
              formatDueDate={formatDueDate}
              getCategoryIcon={getCategoryIcon}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-center text-gray-600">Calendar view coming soon...</p>
        </div>
      )}

      {/* Create/Edit Modals */}
      {showCreateModal && (
        <TaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}

      {showEditModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedTask(null);
            fetchData();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, taskId: null })}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}

// Task Card Component
function TaskCard({ task, onStatusChange, onComplete, onEdit, onDelete, formatDueDate, getCategoryIcon }) {
  const priority = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.medium;
  const status = STATUS_COLORS[task.status] || STATUS_COLORS.pending;
  const isOverdue = task.status === 'overdue';
  const isCompleted = task.status === 'completed';

  const checklistProgress = task.checklist?.length > 0
    ? Math.round((task.checklist.filter(item => item.completed).length / task.checklist.length) * 100)
    : null;

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow border-l-4 ${priority.border}`}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Checkbox */}
          <button
            onClick={() => !isCompleted && onComplete(task.id)}
            disabled={isCompleted}
            className={`flex-shrink-0 mt-1 ${isCompleted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <div className="w-6 h-6 border-2 border-gray-300 rounded hover:border-green-600"></div>
            )}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl">{getCategoryIcon(task.category)}</span>
                <h3 className={`font-semibold text-gray-900 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.bg} ${status.text}`}>
                  {task.status.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${priority.bg} ${priority.text}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{task.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              {task.dueDate && (
                <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                  <Clock className="w-4 h-4" />
                  {formatDueDate(task.dueDate, task.dueTime)}
                </span>
              )}

              {task.assignee && (
                <span>
                  Assigned to: {task.assignee.firstName} {task.assignee.lastName}
                </span>
              )}

              {task.zone && (
                <span>Zone: {task.zone.name}</span>
              )}

              {task.batch && (
                <span>Batch: {task.batch.batchNumber}</span>
              )}

              {checklistProgress !== null && (
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-4 h-4" />
                  {task.checklist.filter(i => i.completed).length}/{task.checklist.length} completed
                </span>
              )}
            </div>

            {/* Checklist Progress Bar */}
            {checklistProgress !== null && (
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${checklistProgress}%` }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          {!isCompleted && (
            <div className="flex-shrink-0 flex items-center gap-1">
              {task.status === 'pending' && (
                <button
                  onClick={() => onStatusChange(task.id, 'in_progress')}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Start task"
                >
                  <Play className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => onEdit()}
                className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Task Create/Edit Modal
function TaskModal({ task, onClose, onSuccess }) {
  const [formData, setFormData] = useState(task || {
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    dueDate: '',
    dueTime: '',
    estimatedDuration: '',
    zoneId: '',
    batchId: '',
    isRecurring: false,
    recurrencePattern: 'daily',
    recurrenceInterval: 1,
    checklist: []
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (task) {
        await taskService.update(task.id, formData);
      } else {
        await taskService.create(formData);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving task:', error);
      setError(error.response?.data?.error || 'Failed to save task');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., Check humidity levels"
            />
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
              placeholder="Add details about this task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority *
              </label>
              <select
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate ? formData.dueDate.split('T')[0] : ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Time
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => setFormData({ ...formData, dueTime: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Duration (minutes)
            </label>
            <input
              type="number"
              min="0"
              value={formData.estimatedDuration}
              onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="e.g., 30"
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
              {saving ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


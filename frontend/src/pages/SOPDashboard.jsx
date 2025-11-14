import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sopService } from '../services/api';
import { Plus, FileText, Play, CheckCircle, Clock, Copy, Edit2, Trash2, Eye } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ConfirmDialog from '../components/ConfirmDialog';

const SOPDashboard = () => {
  const toast = useToast();
  const [sops, setSOPs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, sopId: null });
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sopsRes, statsRes] = await Promise.all([
        sopService.getAll(filters),
        sopService.getStats()
      ]);
      setSOPs(sopsRes.data.sops || sopsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching SOPs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await sopService.delete(deleteDialog.sopId);
      toast.success('SOP deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting SOP:', error);
      toast.error('Failed to delete SOP');
    } finally {
      setDeleteDialog({ isOpen: false, sopId: null });
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await sopService.duplicate(id);
      toast.success('SOP duplicated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error duplicating SOP:', error);
      toast.error('Failed to duplicate SOP');
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      archived: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SOP Management</h1>
          <p className="text-gray-600 mt-1">Standard Operating Procedures</p>
        </div>
        <Link
          to="/sop/editor"
          className="btn-primary flex items-center gap-2 whitespace-nowrap px-6 py-2"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">New SOP</span>
          <span className="sm:hidden">New</span>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total SOPs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalSOPs}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeSOPs}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.draftSOPs}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Executions</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalExecutions}</p>
              </div>
              <Play className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search SOPs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Categories</option>
              <option value="cultivation">Cultivation</option>
              <option value="harvesting">Harvesting</option>
              <option value="processing">Processing</option>
              <option value="packaging">Packaging</option>
              <option value="quality">Quality Control</option>
              <option value="maintenance">Maintenance</option>
              <option value="safety">Safety</option>
            </select>
          </div>

          <div>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
      </div>

      {/* SOPs List */}
      <div className="grid grid-cols-1 gap-4">
        {sops.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-md text-center">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No SOPs found</p>
            <Link
              to="/sop/editor"
              className="mt-4 inline-block text-green-600 hover:text-green-700 font-medium"
            >
              Create your first SOP
            </Link>
          </div>
        ) : (
          sops.map(sop => (
            <div key={sop.id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{sop.title}</h3>
                    {getStatusBadge(sop.status)}
                    {sop.isPublic && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        Public
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{sop.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span><strong>SOP#:</strong> {sop.sopNumber}</span>
                    <span><strong>Category:</strong> {sop.category}</span>
                    <span><strong>Version:</strong> {sop.version}</span>
                    {sop.steps && <span><strong>Steps:</strong> {sop.steps.length}</span>}
                    {sop.executionCount > 0 && (
                      <span><strong>Executions:</strong> {sop.executionCount}</span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Link
                    to={`/sop/execute/${sop.id}`}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Execute SOP"
                  >
                    <Play className="w-5 h-5" />
                  </Link>
                  <Link
                    to={`/sop/editor/${sop.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View/Edit"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleDuplicate(sop.id)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setDeleteDialog({ isOpen: true, sopId: sop.id })}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/sop/executions"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-purple-500"
        >
          <div className="flex items-center gap-4">
            <Play className="w-8 h-8 text-purple-600" />
            <div>
              <h4 className="font-semibold text-gray-900">My Executions</h4>
              <p className="text-sm text-gray-600">View execution history</p>
            </div>
          </div>
        </Link>

        <Link
          to="/sop/editor"
          className="p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-green-500"
        >
          <div className="flex items-center gap-4">
            <Plus className="w-8 h-8 text-green-600" />
            <div>
              <h4 className="font-semibold text-gray-900">Create New SOP</h4>
              <p className="text-sm text-gray-600">Define procedures</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, sopId: null })}
        onConfirm={handleDelete}
        title="Delete SOP"
        message="Are you sure you want to delete this Standard Operating Procedure? This action cannot be undone."
        confirmText="Delete SOP"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default SOPDashboard;


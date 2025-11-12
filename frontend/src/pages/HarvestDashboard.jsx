import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import HarvestForm from '../components/HarvestForm';
import HarvestCharts from '../components/HarvestCharts';
import HarvestExport from '../components/HarvestExport';
import { Plus, TrendingUp, Filter, Calendar } from 'lucide-react';

/**
 * Harvest Dashboard Page
 * Main page for harvest tracking and analytics
 */
const HarvestDashboard = () => {
  const { zoneId } = useParams();
  const [harvests, setHarvests] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [filters, setFilters] = useState({
    batchId: '',
    flushNumber: '',
    startDate: '',
    endDate: '',
    qualityGrade: ''
  });

  // Fetch harvests
  useEffect(() => {
    fetchHarvests();
  }, [zoneId, filters]);

  const fetchHarvests = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (zoneId) queryParams.append('zoneId', zoneId);
      if (filters.batchId) queryParams.append('batchId', filters.batchId);
      if (filters.flushNumber) queryParams.append('flushNumber', filters.flushNumber);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      if (filters.qualityGrade) queryParams.append('qualityGrade', filters.qualityGrade);

      const response = await fetch(`/api/harvests?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHarvests(data.data);
      }
    } catch (error) {
      console.error('Error fetching harvests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitHarvest = async (harvestData) => {
    try {
      const response = await fetch('/api/harvests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(harvestData)
      });

      if (response.ok) {
        const data = await response.json();
        alert('Harvest recorded successfully!');
        setShowForm(false);
        fetchHarvests(); // Refresh data
      } else {
        const error = await response.json();
        alert(`Failed to record harvest: ${error.error}`);
      }
    } catch (error) {
      console.error('Error submitting harvest:', error);
      alert('Failed to submit harvest. Please try again.');
    }
  };

  const getBatchSummary = async (batchId) => {
    try {
      const response = await fetch(`/api/harvests/batch/${batchId}/summary`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching batch summary:', error);
    }
    return null;
  };

  // Group harvests by batch
  const batchGroups = harvests.reduce((groups, harvest) => {
    const batchId = harvest.batchId;
    if (!groups[batchId]) {
      groups[batchId] = [];
    }
    groups[batchId].push(harvest);
    return groups;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading harvest data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                🍄 Harvest Tracking
              </h1>
              <p className="text-gray-600 mt-1">
                Track yield, quality, and performance metrics
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Record Harvest
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              placeholder="Batch ID"
              value={filters.batchId}
              onChange={(e) => setFilters({...filters, batchId: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
            
            <select
              value={filters.flushNumber}
              onChange={(e) => setFilters({...filters, flushNumber: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Flushes</option>
              <option value="1">Flush 1</option>
              <option value="2">Flush 2</option>
              <option value="3">Flush 3</option>
            </select>

            <select
              value={filters.qualityGrade}
              onChange={(e) => setFilters({...filters, qualityGrade: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            >
              <option value="">All Grades</option>
              <option value="premium">Premium</option>
              <option value="grade_a">Grade A</option>
              <option value="grade_b">Grade B</option>
              <option value="rejected">Rejected</option>
            </select>

            <input
              type="date"
              placeholder="Start Date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />

            <input
              type="date"
              placeholder="End Date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={fetchHarvests}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Apply Filters
            </button>
            <button
              onClick={() => setFilters({ batchId: '', flushNumber: '', startDate: '', endDate: '', qualityGrade: '' })}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Charts */}
        {harvests.length > 0 && (
          <div className="mb-6">
            <HarvestCharts harvests={harvests} batches={Object.entries(batchGroups).map(([batchId, harvests]) => ({
              batchId,
              totalYieldKg: harvests.reduce((sum, h) => sum + h.totalWeightKg, 0),
              avgBiologicalEfficiency: harvests.reduce((sum, h) => sum + (h.biologicalEfficiency || 0), 0) / harvests.length
            }))} />
          </div>
        )}

        {/* Export */}
        {harvests.length > 0 && selectedBatch && (
          <div className="mb-6">
            <HarvestExport 
              batchId={selectedBatch} 
              harvests={batchGroups[selectedBatch] || []}
              summary={batches.find(b => b.batchId === selectedBatch)}
            />
          </div>
        )}

        {/* Batch List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Harvest Records</h3>
          
          {Object.entries(batchGroups).length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No harvest records yet</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Record Your First Harvest
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(batchGroups).map(([batchId, batchHarvests]) => {
                const totalYield = batchHarvests.reduce((sum, h) => sum + h.totalWeightKg, 0);
                const avgBE = batchHarvests.reduce((sum, h) => sum + (h.biologicalEfficiency || 0), 0) / batchHarvests.length;

                return (
                  <div key={batchId} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">
                          Batch: {batchId}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {batchHarvests.length} flush{batchHarvests.length > 1 ? 'es' : ''} • 
                          Total: {totalYield.toFixed(1)} kg • 
                          Avg BE: {avgBE.toFixed(1)}%
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const summary = await getBatchSummary(batchId);
                          setBatches(prev => [...prev, summary]);
                          setSelectedBatch(batchId);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        View Report
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Flush</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Weight (kg)</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bags</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quality</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">BE%</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {batchHarvests.map((harvest, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{harvest.flushNumber}</td>
                              <td className="px-4 py-3 text-sm">
                                {new Date(harvest.harvestDate).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold">{harvest.totalWeightKg}</td>
                              <td className="px-4 py-3 text-sm">{harvest.bagsHarvested}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  harvest.qualityGrade === 'premium' ? 'bg-green-100 text-green-800' :
                                  harvest.qualityGrade === 'grade_a' ? 'bg-blue-100 text-blue-800' :
                                  harvest.qualityGrade === 'grade_b' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {harvest.qualityGrade ? harvest.qualityGrade.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {harvest.biologicalEfficiency ? `${harvest.biologicalEfficiency.toFixed(1)}%` : '-'}
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold">
                                ₹{harvest.totalRevenue || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Harvest Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <HarvestForm
              batchId="20251112-zone-a" // This would come from current active batch
              zoneId={zoneId || 'zone-a'}
              flushNumber={1}
              substrateWeightKg={250}
              onSubmit={handleSubmitHarvest}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HarvestDashboard;


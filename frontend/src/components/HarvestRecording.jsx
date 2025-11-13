import { useState, useEffect } from 'react';
import { X, Package, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function HarvestRecording({ batch, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    zoneId: batch?.zoneId || '',
    batchId: batch?.batchNumber || '',
    flushNumber: '',
    totalWeightKg: '',
    bagsHarvested: '',
    bagsDiscarded: '0',
    qualityGrade: 'grade_a',
    harvestDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        totalWeightKg: parseFloat(formData.totalWeightKg),
        bagsHarvested: parseInt(formData.bagsHarvested) || 0,
        bagsDiscarded: parseInt(formData.bagsDiscarded) || 0,
        flushNumber: parseInt(formData.flushNumber)
      };

      console.log('Submitting harvest data:', submitData);
      await api.post('/harvests', submitData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error recording harvest:', error);
      console.error('Full error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to record harvest';
      const errorDetails = error.response?.data?.error;
      setError(errorDetails ? `${errorMsg}\n\n${errorDetails}` : errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Record Harvest</h2>
              <p className="text-sm text-gray-600">{batch?.cropName} - {batch?.batchNumber}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flush Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Flush Number *
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.flushNumber}
                onChange={(e) => setFormData({ ...formData, flushNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="1, 2, 3..."
              />
              <p className="text-xs text-gray-500 mt-1">Which flush/harvest is this?</p>
            </div>

            {/* Harvest Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Harvest Date *
              </label>
              <input
                type="date"
                required
                value={formData.harvestDate}
                onChange={(e) => setFormData({ ...formData, harvestDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Total Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Weight (kg) *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.totalWeightKg}
                onChange={(e) => setFormData({ ...formData, totalWeightKg: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., 5.5"
              />
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Grade
              </label>
              <select
                value={formData.qualityGrade}
                onChange={(e) => setFormData({ ...formData, qualityGrade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="premium">Premium</option>
                <option value="grade_a">Grade A</option>
                <option value="grade_b">Grade B</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Bags Harvested */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bags Harvested
              </label>
              <input
                type="number"
                min="0"
                value={formData.bagsHarvested}
                onChange={(e) => setFormData({ ...formData, bagsHarvested: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Number of bags"
              />
            </div>

            {/* Bags Discarded */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bags Discarded
              </label>
              <input
                type="number"
                min="0"
                value={formData.bagsDiscarded}
                onChange={(e) => setFormData({ ...formData, bagsDiscarded: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Contaminated bags"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows="3"
              placeholder="Quality observations, issues, etc."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Recording...' : 'Record Harvest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


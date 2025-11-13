import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { qualityControlService, qualityStandardService, farmService, zoneService } from '../services/api';
import { ArrowLeft, Plus, X, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../components/ToastContainer';

const QualityInspection = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [farms, setFarms] = useState([]);
  const [zones, setZones] = useState([]);
  const [batches, setBatches] = useState([]);
  const [standards, setStandards] = useState([]);
  const [defects, setDefects] = useState([]);
  const [formData, setFormData] = useState({
    inspectionType: 'harvest',
    category: 'appearance',
    farmId: '',
    zoneId: '',
    batchId: '',
    standardId: '',
    sampleSize: '',
    samplingMethod: 'random',
    result: 'pending',
    overallScore: '',
    notes: '',
    correctiveActions: '',
  });

  useEffect(() => {
    fetchFarms();
    fetchStandards();
  }, []);

  useEffect(() => {
    if (formData.farmId) {
      fetchZones(formData.farmId);
    }
  }, [formData.farmId]);

  useEffect(() => {
    if (formData.zoneId) {
      fetchBatches(formData.zoneId);
    }
  }, [formData.zoneId]);

  const fetchFarms = async () => {
    try {
      const res = await farmService.getAll();
      setFarms(res.data);
    } catch (error) {
      console.error('Error fetching farms:', error);
    }
  };

  const fetchZones = async (farmId) => {
    try {
      const res = await zoneService.getAll();
      setZones(res.data.filter(zone => zone.farmId === farmId));
    } catch (error) {
      console.error('Error fetching zones:', error);
    }
  };

  const fetchBatches = async (zoneId) => {
    try {
      const res = await api.get(`/batches?zoneId=${zoneId}&status=active`);
      setBatches(res.data.batches || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  };

  const fetchStandards = async () => {
    try {
      const res = await qualityStandardService.getActive();
      setStandards(res.data);
    } catch (error) {
      console.error('Error fetching standards:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addDefect = () => {
    setDefects([
      ...defects,
      {
        id: Date.now(),
        type: '',
        severity: 'minor',
        description: '',
        location: '',
        affectedQuantity: '',
        rootCause: '',
        correctiveAction: '',
      }
    ]);
  };

  const updateDefect = (id, field, value) => {
    setDefects(defects.map(defect =>
      defect.id === id ? { ...defect, [field]: value } : defect
    ));
  };

  const removeDefect = (id) => {
    setDefects(defects.filter(defect => defect.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.sampleSize || !formData.standardId) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create quality check
      const checkData = {
        ...formData,
        sampleSize: parseInt(formData.sampleSize),
        overallScore: formData.overallScore ? parseFloat(formData.overallScore) : null,
        inspectedAt: new Date(),
      };

      const res = await qualityControlService.createCheck(checkData);
      const qualityCheckId = res.data.id;

      // Add defects if any
      for (const defect of defects) {
        if (defect.type && defect.description) {
          await qualityControlService.addDefect(qualityCheckId, {
            ...defect,
            affectedQuantity: defect.affectedQuantity ? parseFloat(defect.affectedQuantity) : null,
          });
        }
      }

      toast.success('Quality inspection recorded successfully!');
      navigate('/quality');
    } catch (error) {
      console.error('Error creating inspection:', error);
      toast.error('Failed to record inspection: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/quality"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quality Inspection</h1>
          <p className="text-gray-600 mt-1">Record quality check and defects</p>
        </div>
      </div>

      {/* Inspection Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Inspection Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Inspection Type *
              </label>
              <select
                name="inspectionType"
                value={formData.inspectionType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="harvest">Harvest</option>
                <option value="pre-harvest">Pre-Harvest</option>
                <option value="post-harvest">Post-Harvest</option>
                <option value="packaging">Packaging</option>
                <option value="storage">Storage</option>
                <option value="substrate">Substrate</option>
                <option value="environmental">Environmental</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="appearance">Appearance</option>
                <option value="size">Size</option>
                <option value="color">Color</option>
                <option value="texture">Texture</option>
                <option value="contamination">Contamination</option>
                <option value="packaging">Packaging</option>
                <option value="labeling">Labeling</option>
                <option value="weight">Weight</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Farm
              </label>
              <select
                name="farmId"
                value={formData.farmId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Farm</option>
                {farms.map(farm => (
                  <option key={farm.id} value={farm.id}>{farm.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone
              </label>
              <select
                name="zoneId"
                value={formData.zoneId}
                onChange={handleChange}
                disabled={!formData.farmId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Zone</option>
                {zones.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Batch
              </label>
              <select
                name="batchId"
                value={formData.batchId}
                onChange={handleChange}
                disabled={!formData.zoneId}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="">Select Batch</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.batchNumber}>
                    {batch.batchNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality Standard *
              </label>
              <select
                name="standardId"
                value={formData.standardId}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Standard</option>
                {standards.map(std => (
                  <option key={std.id} value={std.id}>
                    {std.name} ({std.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Size *
              </label>
              <input
                type="number"
                name="sampleSize"
                value={formData.sampleSize}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sampling Method
              </label>
              <select
                name="samplingMethod"
                value={formData.samplingMethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="random">Random</option>
                <option value="systematic">Systematic</option>
                <option value="stratified">Stratified</option>
                <option value="convenience">Convenience</option>
                <option value="complete">Complete (100%)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Score (0-100)
              </label>
              <input
                type="number"
                name="overallScore"
                value={formData.overallScore}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result
              </label>
              <select
                name="result"
                value={formData.result}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="conditional">Conditional</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Additional observations..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Corrective Actions
            </label>
            <textarea
              name="correctiveActions"
              value={formData.correctiveActions}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Actions taken or recommended..."
            />
          </div>
        </div>

        {/* Defects Section */}
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Defects Found</h2>
            <button
              type="button"
              onClick={addDefect}
              className="btn-secondary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Defect
            </button>
          </div>

          {defects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No defects found - Perfect! 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {defects.map((defect, index) => (
                <div key={defect.id} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Defect #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeDefect(defect.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type *
                      </label>
                      <select
                        value={defect.type}
                        onChange={(e) => updateDefect(defect.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">Select type</option>
                        <option value="discoloration">Discoloration</option>
                        <option value="contamination">Contamination</option>
                        <option value="damage">Physical Damage</option>
                        <option value="undersized">Undersized</option>
                        <option value="oversized">Oversized</option>
                        <option value="deformity">Deformity</option>
                        <option value="spots">Spots</option>
                        <option value="bruising">Bruising</option>
                        <option value="decay">Decay</option>
                        <option value="pest">Pest Damage</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Severity *
                      </label>
                      <select
                        value={defect.severity}
                        onChange={(e) => updateDefect(defect.id, 'severity', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="minor">Minor</option>
                        <option value="major">Major</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={defect.location}
                        onChange={(e) => updateDefect(defect.id, 'location', e.target.value)}
                        placeholder="e.g., Cap, Stem, Base"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Affected Quantity (kg)
                      </label>
                      <input
                        type="number"
                        value={defect.affectedQuantity}
                        onChange={(e) => updateDefect(defect.id, 'affectedQuantity', e.target.value)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        value={defect.description}
                        onChange={(e) => updateDefect(defect.id, 'description', e.target.value)}
                        rows={2}
                        placeholder="Detailed description of the defect..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Root Cause
                      </label>
                      <input
                        type="text"
                        value={defect.rootCause}
                        onChange={(e) => updateDefect(defect.id, 'rootCause', e.target.value)}
                        placeholder="Why did this occur?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Corrective Action
                      </label>
                      <input
                        type="text"
                        value={defect.correctiveAction}
                        onChange={(e) => updateDefect(defect.id, 'correctiveAction', e.target.value)}
                        placeholder="What action should be taken?"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Link
            to="/quality"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 px-6 py-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Inspection
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QualityInspection;


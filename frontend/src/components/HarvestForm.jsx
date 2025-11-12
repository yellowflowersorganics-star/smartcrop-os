import { useState } from 'react';
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react';

/**
 * HarvestForm Component
 * Comprehensive form for recording harvest data with quality grading and photo uploads
 */
const HarvestForm = ({ 
  batchId, 
  zoneId, 
  flushNumber = 1,
  substrateWeightKg,
  onSubmit, 
  onCancel 
}) => {
  const [formData, setFormData] = useState({
    totalWeightKg: '',
    bagsHarvested: '',
    bagsDiscarded: 0,
    avgMushroomWeightG: '',
    qualityGrade: '',
    defectNotes: [],
    harvesterName: '',
    marketDestination: '',
    pricePerKg: '',
    harvestNotes: '',
    photoUrls: []
  });

  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});

  // Quality grade options
  const qualityGrades = [
    {
      value: 'premium',
      label: 'Premium (A+)',
      description: 'Perfect caps, uniform size, no damage',
      color: 'text-green-600'
    },
    {
      value: 'grade_a',
      label: 'Grade A',
      description: 'Good quality, minor imperfections',
      color: 'text-blue-600'
    },
    {
      value: 'grade_b',
      label: 'Grade B',
      description: 'Irregular shape, but edible',
      color: 'text-yellow-600'
    },
    {
      value: 'rejected',
      label: 'Rejected',
      description: 'Damaged, diseased, or poor quality',
      color: 'text-red-600'
    }
  ];

  // Defect options
  const defectOptions = [
    'Long stems (high CO2)',
    'Small caps (low humidity)',
    'Dry/cracked edges',
    'Yellowing',
    'Insect damage',
    'Bacterial spots',
    'Bruising',
    'Spore drop',
    'Other'
  ];

  // Market destinations
  const marketOptions = [
    'local_market',
    'wholesale',
    'restaurant',
    'direct_consumer',
    'export',
    'self_consumption',
    'other'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      // Handle defect notes checkboxes
      setFormData(prev => ({
        ...prev,
        defectNotes: checked 
          ? [...prev.defectNotes, value]
          : prev.defectNotes.filter(d => d !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);

    try {
      // In production, upload to cloud storage (S3, Cloudinary, etc.)
      // For now, create local URLs
      const newPhotos = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name
      }));

      setPhotos(prev => [...prev, ...newPhotos]);
      
      // Update form data with photo URLs (in production, these would be cloud URLs)
      setFormData(prev => ({
        ...prev,
        photoUrls: [...prev.photoUrls, ...newPhotos.map(p => p.preview)]
      }));
    } catch (error) {
      console.error('Error uploading photos:', error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photoUrls: prev.photoUrls.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.totalWeightKg || parseFloat(formData.totalWeightKg) <= 0) {
      newErrors.totalWeightKg = 'Total weight is required and must be positive';
    }

    if (!formData.bagsHarvested || parseInt(formData.bagsHarvested) <= 0) {
      newErrors.bagsHarvested = 'Number of bags harvested is required';
    }

    if (!formData.qualityGrade) {
      newErrors.qualityGrade = 'Quality grade is required';
    }

    if (!formData.harvesterName || formData.harvesterName.trim() === '') {
      newErrors.harvesterName = 'Harvester name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateMetrics = () => {
    const weight = parseFloat(formData.totalWeightKg);
    const bags = parseInt(formData.bagsHarvested);
    
    const metrics = {};

    if (weight && bags) {
      metrics.yieldPerBag = (weight / bags).toFixed(2);
    }

    if (weight && substrateWeightKg) {
      metrics.biologicalEfficiency = ((weight / substrateWeightKg) * 100).toFixed(2);
    }

    if (weight && formData.pricePerKg) {
      metrics.revenue = (weight * parseFloat(formData.pricePerKg)).toFixed(2);
    }

    return metrics;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const metrics = calculateMetrics();

    const harvestData = {
      batchId,
      zoneId,
      flushNumber,
      substrateWeightKg,
      ...formData,
      totalWeightKg: parseFloat(formData.totalWeightKg),
      bagsHarvested: parseInt(formData.bagsHarvested),
      bagsDiscarded: parseInt(formData.bagsDiscarded) || 0,
      avgMushroomWeightG: formData.avgMushroomWeightG ? parseFloat(formData.avgMushroomWeightG) : null,
      pricePerKg: formData.pricePerKg ? parseFloat(formData.pricePerKg) : null,
      ...metrics
    };

    await onSubmit(harvestData);
  };

  const metrics = calculateMetrics();

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          🍄 Harvest - Flush {flushNumber}
        </h2>
        <p className="text-gray-600 mt-1">
          Record harvest data for batch {batchId}
        </p>
      </div>

      {/* Harvest Criteria Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">✓ Harvest Criteria</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Caps fully opened (flat, not cupped)</li>
          <li>• Gills visible underneath</li>
          <li>• Edges begin to curl upward</li>
          <li>• Size: 3-5 inches diameter</li>
          <li>• Harvest before spores drop (white dust)</li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Yield Data */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Yield Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Weight (kg) *
              </label>
              <input
                type="number"
                name="totalWeightKg"
                step="0.1"
                min="0"
                value={formData.totalWeightKg}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.totalWeightKg ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 12.5"
              />
              {errors.totalWeightKg && (
                <p className="text-red-500 text-sm mt-1">{errors.totalWeightKg}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bags Harvested *
              </label>
              <input
                type="number"
                name="bagsHarvested"
                min="0"
                value={formData.bagsHarvested}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.bagsHarvested ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., 98"
              />
              {errors.bagsHarvested && (
                <p className="text-red-500 text-sm mt-1">{errors.bagsHarvested}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bags Discarded (contaminated)
              </label>
              <input
                type="number"
                name="bagsDiscarded"
                min="0"
                value={formData.bagsDiscarded}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Mushroom Weight (g)
              </label>
              <input
                type="number"
                name="avgMushroomWeightG"
                step="0.1"
                min="0"
                value={formData.avgMushroomWeightG}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 50"
              />
            </div>
          </div>
        </div>

        {/* Quality Grading */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Quality Assessment</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Grade *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {qualityGrades.map(grade => (
                <label
                  key={grade.value}
                  className={`flex items-start p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.qualityGrade === grade.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="qualityGrade"
                    value={grade.value}
                    checked={formData.qualityGrade === grade.value}
                    onChange={handleChange}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className={`font-semibold ${grade.color}`}>
                      {grade.label}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {grade.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.qualityGrade && (
              <p className="text-red-500 text-sm mt-2">{errors.qualityGrade}</p>
            )}
          </div>

          {/* Defect Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quality Issues (if any)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {defectOptions.map(defect => (
                <label key={defect} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    value={defect}
                    checked={formData.defectNotes.includes(defect)}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-gray-700">{defect}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Photos</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Harvest Photos
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-10 h-10 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB each)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo.preview}
                      alt={`Harvest ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* People & Market */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Harvester & Market</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Harvester Name *
              </label>
              <input
                type="text"
                name="harvesterName"
                value={formData.harvesterName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 ${
                  errors.harvesterName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., John Doe"
              />
              {errors.harvesterName && (
                <p className="text-red-500 text-sm mt-1">{errors.harvesterName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Market Destination
              </label>
              <select
                name="marketDestination"
                value={formData.marketDestination}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select destination</option>
                {marketOptions.map(option => (
                  <option key={option} value={option}>
                    {option.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price per kg (₹)
              </label>
              <input
                type="number"
                name="pricePerKg"
                step="0.01"
                min="0"
                value={formData.pricePerKg}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="e.g., 200"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Harvest Notes
          </label>
          <textarea
            name="harvestNotes"
            value={formData.harvestNotes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Any observations about yield, quality, issues, etc."
          />
        </div>

        {/* Calculated Metrics Preview */}
        {(metrics.yieldPerBag || metrics.biologicalEfficiency || metrics.revenue) && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-3">📊 Calculated Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {metrics.yieldPerBag && (
                <div>
                  <p className="text-sm text-green-700">Yield per Bag</p>
                  <p className="text-2xl font-bold text-green-900">{metrics.yieldPerBag} kg</p>
                </div>
              )}
              {metrics.biologicalEfficiency && (
                <div>
                  <p className="text-sm text-green-700">Biological Efficiency</p>
                  <p className="text-2xl font-bold text-green-900">{metrics.biologicalEfficiency}%</p>
                </div>
              )}
              {metrics.revenue && (
                <div>
                  <p className="text-sm text-green-700">Estimated Revenue</p>
                  <p className="text-2xl font-bold text-green-900">₹{metrics.revenue}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Check className="w-5 h-5" />
            {uploading ? 'Uploading...' : 'Submit Harvest'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HarvestForm;


import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, X, Book, Clock, Sprout, 
  AlertCircle, Copy, Star, TrendingUp
} from 'lucide-react';
import api from '../services/api';

// Recipe Templates
const RECIPE_TEMPLATES = {
  OYSTER_2_FLUSH: {
    cropId: 'oyster-mushroom-2flush-v1',
    cropName: 'Oyster Mushroom (2 Flushes)',
    cropType: 'mushroom',
    description: 'Pleurotus ostreatus - Fast-growing with 2 main flushes. Shorter cycle for faster turnover',
    totalDuration: 33,
    difficulty: 'beginner',
    stages: [
      {
        name: 'Spawn Run / Colonization',
        duration: 14,
        daysFromStart: 0,
        temperature: { min: 20, max: 24, optimal: 22 },
        humidity: { min: 85, max: 95, optimal: 90 },
        co2: { min: 5000, max: 10000, optimal: 7000 },
        light: { min: 0, max: 0, optimal: 0 },
        description: 'Mycelium colonizes the substrate in darkness'
      },
      {
        name: 'Pinning / Fruiting Initiation',
        duration: 5,
        daysFromStart: 14,
        temperature: { min: 12, max: 18, optimal: 15 },
        humidity: { min: 90, max: 95, optimal: 93 },
        co2: { min: 500, max: 1000, optimal: 700 },
        light: { min: 500, max: 1000, optimal: 750 },
        description: 'Trigger pinning with fresh air, light, and temperature drop'
      },
      {
        name: 'Fruiting / Growth - Flush 1',
        duration: 7,
        daysFromStart: 19,
        temperature: { min: 15, max: 20, optimal: 18 },
        humidity: { min: 85, max: 90, optimal: 88 },
        co2: { min: 500, max: 800, optimal: 600 },
        light: { min: 1000, max: 2000, optimal: 1500 },
        description: 'First flush growth to harvest size'
      },
      {
        name: 'Rest Period',
        duration: 5,
        daysFromStart: 26,
        temperature: { min: 18, max: 22, optimal: 20 },
        humidity: { min: 80, max: 85, optimal: 83 },
        co2: { min: 1000, max: 2000, optimal: 1500 },
        light: { min: 500, max: 1000, optimal: 750 },
        description: 'Rest between flushes'
      },
      {
        name: 'Fruiting / Growth - Flush 2',
        duration: 7,
        daysFromStart: 31,
        temperature: { min: 15, max: 20, optimal: 18 },
        humidity: { min: 85, max: 90, optimal: 88 },
        co2: { min: 500, max: 800, optimal: 600 },
        light: { min: 1000, max: 2000, optimal: 1500 },
        description: 'Second flush growth to harvest size'
      }
    ],
    estimatedYield: {
      totalKg: 2.5,
      flushes: 2,
      bioEfficiency: 85
    },
    requiredSensors: ['temperature', 'humidity', 'co2', 'light'],
    requiredActuators: ['humidifier', 'fan', 'heater', 'cooler', 'light'],
    tags: ['mushroom', 'oyster', 'beginner-friendly', 'fast-cycle', '2-flush']
  },
  OYSTER_3_FLUSH: {
  cropId: 'oyster-mushroom-v1',
  cropName: 'Oyster Mushroom',
  cropType: 'mushroom',
  description: 'Pleurotus ostreatus - Fast-growing edible mushroom with multiple flushes',
  totalDuration: 45,
  difficulty: 'beginner',
  stages: [
    {
      name: 'Spawn Run / Colonization',
      duration: 14,
      daysFromStart: 0,
      temperature: { min: 20, max: 24, optimal: 22 },
      humidity: { min: 85, max: 95, optimal: 90 },
      co2: { min: 5000, max: 10000, optimal: 7000 },
      light: { min: 0, max: 0, optimal: 0 },
      description: 'Mycelium colonizes the substrate in darkness'
    },
    {
      name: 'Pinning / Fruiting Initiation',
      duration: 5,
      daysFromStart: 14,
      temperature: { min: 12, max: 18, optimal: 15 },
      humidity: { min: 90, max: 95, optimal: 93 },
      co2: { min: 500, max: 1000, optimal: 700 },
      light: { min: 500, max: 1000, optimal: 750 },
      description: 'Trigger pinning with fresh air, light, and temperature drop'
    },
    {
      name: 'Fruiting / Growth - Flush 1',
      duration: 7,
      daysFromStart: 19,
      temperature: { min: 15, max: 20, optimal: 18 },
      humidity: { min: 85, max: 90, optimal: 88 },
      co2: { min: 500, max: 800, optimal: 600 },
      light: { min: 1000, max: 2000, optimal: 1500 },
      description: 'First flush growth to harvest size'
    },
    {
      name: 'Rest Period',
      duration: 5,
      daysFromStart: 26,
      temperature: { min: 18, max: 22, optimal: 20 },
      humidity: { min: 80, max: 85, optimal: 83 },
      co2: { min: 1000, max: 2000, optimal: 1500 },
      light: { min: 500, max: 1000, optimal: 750 },
      description: 'Rest between flushes'
    },
    {
      name: 'Fruiting / Growth - Flush 2',
      duration: 7,
      daysFromStart: 31,
      temperature: { min: 15, max: 20, optimal: 18 },
      humidity: { min: 85, max: 90, optimal: 88 },
      co2: { min: 500, max: 800, optimal: 600 },
      light: { min: 1000, max: 2000, optimal: 1500 },
      description: 'Second flush growth to harvest size'
    },
    {
      name: 'Rest Period',
      duration: 5,
      daysFromStart: 38,
      temperature: { min: 18, max: 22, optimal: 20 },
      humidity: { min: 80, max: 85, optimal: 83 },
      co2: { min: 1000, max: 2000, optimal: 1500 },
      light: { min: 500, max: 1000, optimal: 750 },
      description: 'Rest before final flush'
    },
    {
      name: 'Fruiting / Growth - Flush 3',
      duration: 7,
      daysFromStart: 43,
      temperature: { min: 15, max: 20, optimal: 18 },
      humidity: { min: 85, max: 90, optimal: 88 },
      co2: { min: 500, max: 800, optimal: 600 },
      light: { min: 1000, max: 2000, optimal: 1500 },
      description: 'Third and final flush'
    }
  ],
  estimatedYield: {
    totalKg: 3.5,
    flushes: 3,
    bioEfficiency: 100
  },
  requiredSensors: ['temperature', 'humidity', 'co2', 'light'],
  requiredActuators: ['humidifier', 'fan', 'heater', 'cooler', 'light'],
  tags: ['mushroom', 'oyster', 'beginner-friendly', 'high-yield', '3-flush']
  },
  BUTTON_MUSHROOM: {
    cropId: 'button-mushroom-v1',
    cropName: 'Button Mushroom (White)',
    cropType: 'mushroom',
    description: 'Agaricus bisporus - Classic white button mushroom with 2 main flushes',
    totalDuration: 60,
    difficulty: 'intermediate',
    stages: [
      {
        name: 'Composting Phase 1',
        duration: 14,
        daysFromStart: 0,
        temperature: { min: 70, max: 80, optimal: 75 },
        humidity: { min: 60, max: 70, optimal: 65 },
        co2: { min: 15000, max: 20000, optimal: 17000 },
        light: { min: 0, max: 0, optimal: 0 },
        description: 'Compost heating and pasteurization'
      },
      {
        name: 'Spawn Run',
        duration: 16,
        daysFromStart: 14,
        temperature: { min: 24, max: 26, optimal: 25 },
        humidity: { min: 85, max: 95, optimal: 90 },
        co2: { min: 5000, max: 8000, optimal: 6000 },
        light: { min: 0, max: 0, optimal: 0 },
        description: 'Mycelium colonizes compost in darkness'
      },
      {
        name: 'Casing Layer',
        duration: 5,
        daysFromStart: 30,
        temperature: { min: 22, max: 24, optimal: 23 },
        humidity: { min: 90, max: 95, optimal: 93 },
        co2: { min: 3000, max: 5000, optimal: 4000 },
        light: { min: 0, max: 0, optimal: 0 },
        description: 'Apply casing layer and allow colonization'
      },
      {
        name: 'Pinning',
        duration: 7,
        daysFromStart: 35,
        temperature: { min: 16, max: 18, optimal: 17 },
        humidity: { min: 90, max: 95, optimal: 93 },
        co2: { min: 800, max: 1200, optimal: 1000 },
        light: { min: 200, max: 400, optimal: 300 },
        description: 'Trigger pinning with temperature drop and fresh air'
      },
      {
        name: 'Fruiting - Flush 1',
        duration: 7,
        daysFromStart: 42,
        temperature: { min: 16, max: 18, optimal: 17 },
        humidity: { min: 85, max: 90, optimal: 88 },
        co2: { min: 800, max: 1200, optimal: 1000 },
        light: { min: 200, max: 400, optimal: 300 },
        description: 'First flush growth to harvest'
      },
      {
        name: 'Rest Period',
        duration: 7,
        daysFromStart: 49,
        temperature: { min: 18, max: 20, optimal: 19 },
        humidity: { min: 80, max: 85, optimal: 83 },
        co2: { min: 1500, max: 2500, optimal: 2000 },
        light: { min: 100, max: 200, optimal: 150 },
        description: 'Rest and prepare for second flush'
      },
      {
        name: 'Fruiting - Flush 2',
        duration: 7,
        daysFromStart: 56,
        temperature: { min: 16, max: 18, optimal: 17 },
        humidity: { min: 85, max: 90, optimal: 88 },
        co2: { min: 800, max: 1200, optimal: 1000 },
        light: { min: 200, max: 400, optimal: 300 },
        description: 'Second flush growth to harvest'
      }
    ],
    estimatedYield: {
      totalKg: 4.0,
      flushes: 2,
      bioEfficiency: 110
    },
    requiredSensors: ['temperature', 'humidity', 'co2', 'light'],
    requiredActuators: ['humidifier', 'fan', 'heater', 'cooler', 'light'],
    tags: ['mushroom', 'button', 'agaricus', 'intermediate', '2-flush', 'high-value']
  }
};

// Default template for backward compatibility
const OYSTER_MUSHROOM_TEMPLATE = RECIPE_TEMPLATES.OYSTER_3_FLUSH;

export default function CropRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showTemplateList, setShowTemplateList] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/crop-recipes');
      setRecipes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to load recipes');
    } finally {
      setLoading(false);
    }
  };

  const createFromTemplate = async (template) => {
    try {
      await api.post('/crop-recipes', template || selectedTemplate);
      setShowTemplateModal(false);
      setShowTemplateList(false);
      setSelectedTemplate(null);
      fetchRecipes();
    } catch (error) {
      console.error('Error creating recipe:', error);
      setError(error.response?.data?.message || 'Failed to create recipe');
    }
  };

  const openTemplatePreview = (template) => {
    setSelectedTemplate(template);
    setShowTemplateList(false);
    setShowTemplateModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/crop-recipes/${id}`);
      setDeleteConfirm(null);
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      setError('Failed to delete recipe');
    }
  };

  const handleClone = async (id) => {
    try {
      await api.post(`/crop-recipes/${id}/clone`);
      fetchRecipes();
    } catch (error) {
      console.error('Error cloning recipe:', error);
      setError('Failed to clone recipe');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading recipes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Crop Recipes</h1>
          <p className="text-gray-600 mt-1">Manage your growing recipes and environmental parameters</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowTemplateList(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Star className="w-5 h-5" />
            Use Template
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Custom
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Recipes Grid */}
      {recipes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating your first crop recipe or use our Oyster Mushroom template
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowTemplateList(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              Choose Template
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Custom Recipe
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 overflow-hidden"
            >
              {/* Recipe Header */}
              <div className="p-6 pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      to={`/recipes/${recipe.id}`}
                      className="text-xl font-semibold text-gray-900 hover:text-green-600 transition-colors"
                    >
                      {recipe.cropName}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 capitalize">{recipe.cropType}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClone(recipe.id)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Clone recipe"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/recipes/${recipe.id}/edit`}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit recipe"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(recipe.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete recipe"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {recipe.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{recipe.description}</p>
                )}

                {/* Recipe Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500">Duration</p>
                      <p className="text-sm font-semibold text-gray-900">{recipe.totalDuration} days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-green-600" />
                    <div>
                      <p className="text-xs text-gray-500">Stages</p>
                      <p className="text-sm font-semibold text-gray-900">{recipe.stages?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-orange-600" />
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    recipe.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    recipe.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
                  </span>
                </div>

                {/* Tags */}
                {recipe.tags && recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {recipe.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                        +{recipe.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Recipe Footer */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
                <Link
                  to={`/recipes/${recipe.id}`}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Template Selection Modal */}
      {showTemplateList && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Choose a Recipe Template</h2>
              <button
                onClick={() => setShowTemplateList(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Oyster 2 Flush */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
                     onClick={() => openTemplatePreview(RECIPE_TEMPLATES.OYSTER_2_FLUSH)}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">🍄 Oyster Mushroom</h3>
                      <p className="text-sm text-blue-600 font-medium">2 Flushes • 33 Days</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Beginner
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Fast cycle for quicker turnover. Ideal for testing or high-frequency production.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Yield</p>
                      <p className="font-bold text-gray-900">2.5 kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stages</p>
                      <p className="font-bold text-gray-900">5</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bio Eff.</p>
                      <p className="font-bold text-gray-900">85%</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Preview Recipe
                  </button>
                </div>

                {/* Oyster 3 Flush */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
                     onClick={() => openTemplatePreview(RECIPE_TEMPLATES.OYSTER_3_FLUSH)}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">🍄 Oyster Mushroom</h3>
                      <p className="text-sm text-blue-600 font-medium">3 Flushes • 45 Days</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Beginner
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Maximum yield with 3 flushes. Best for optimizing production from each substrate.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Yield</p>
                      <p className="font-bold text-gray-900">3.5 kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stages</p>
                      <p className="font-bold text-gray-900">7</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bio Eff.</p>
                      <p className="font-bold text-gray-900">100%</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Preview Recipe
                  </button>
                </div>

                {/* Button Mushroom */}
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors cursor-pointer"
                     onClick={() => openTemplatePreview(RECIPE_TEMPLATES.BUTTON_MUSHROOM)}>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">🍄 Button Mushroom</h3>
                      <p className="text-sm text-blue-600 font-medium">2 Flushes • 60 Days</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Intermediate
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Classic white button mushroom. Requires composting phase but offers premium pricing.
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500">Yield</p>
                      <p className="font-bold text-gray-900">4.0 kg</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Stages</p>
                      <p className="font-bold text-gray-900">7</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Bio Eff.</p>
                      <p className="font-bold text-gray-900">110%</p>
                    </div>
                  </div>
                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Preview Recipe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showTemplateModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate.cropName}</h2>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setShowTemplateList(true);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Template Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">🍄 {selectedTemplate.cropName}</h3>
                <p className="text-sm text-gray-700">{selectedTemplate.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Duration</p>
                    <p className="text-lg font-bold text-blue-600">{selectedTemplate.totalDuration} days</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Stages</p>
                    <p className="text-lg font-bold text-blue-600">{selectedTemplate.stages.length}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Difficulty</p>
                    <p className="text-lg font-bold text-green-600 capitalize">{selectedTemplate.difficulty}</p>
                  </div>
                </div>
              </div>

              {/* Stages Preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Growth Stages</h3>
                <div className="space-y-3">
                  {selectedTemplate.stages.map((stage, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{stage.name}</h4>
                        <span className="text-sm text-gray-600">{stage.duration} days</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                      <div className="grid grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-gray-500">Temp</p>
                          <p className="font-medium">{stage.temperature.optimal}°C</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Humidity</p>
                          <p className="font-medium">{stage.humidity.optimal}%</p>
                        </div>
                        <div>
                          <p className="text-gray-500">CO₂</p>
                          <p className="font-medium">{stage.co2.optimal} ppm</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Light</p>
                          <p className="font-medium">{stage.light.optimal} lux</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expected Yield */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Expected Yield</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Total Yield</p>
                    <p className="text-lg font-bold text-green-600">{selectedTemplate.estimatedYield.totalKg} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Flushes</p>
                    <p className="text-lg font-bold text-green-600">{selectedTemplate.estimatedYield.flushes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Bio Efficiency</p>
                    <p className="text-lg font-bold text-green-600">{selectedTemplate.estimatedYield.bioEfficiency}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-between">
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setShowTemplateList(true);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ← Back to Templates
              </button>
              <button
                onClick={() => createFromTemplate(selectedTemplate)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Create This Recipe
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Recipe</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this recipe? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coming Soon Modal for Custom Creation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Custom Recipe Builder</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Custom recipe builder is coming soon! For now, you can:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Use the Oyster Mushroom template</li>
              <li>Clone and modify existing recipes</li>
              <li>Edit recipes after creation</li>
            </ul>
            <button
              onClick={() => setShowModal(false)}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

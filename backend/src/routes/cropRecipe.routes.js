/**
 * SmartCrop OS - Crop Recipe Routes
 * CRUD operations for crop recipes
 */

const express = require('express');
const router = express.Router();
const cropRecipeController = require('../controllers/cropRecipe.controller');
const { authenticate } = require('../middleware/auth');
const { validateCropRecipe } = require('../middleware/validators');

// Public routes - browse available recipes
router.get('/public', cropRecipeController.getPublicRecipes);
router.get('/public/:id', cropRecipeController.getPublicRecipeById);

// Protected routes - require authentication
router.use(authenticate);

// Get all crop recipes for user
router.get('/', cropRecipeController.getAllRecipes);

// Get specific crop recipe
router.get('/:id', cropRecipeController.getRecipeById);

// Create new crop recipe
router.post('/', validateCropRecipe, cropRecipeController.createRecipe);

// Update crop recipe
router.put('/:id', validateCropRecipe, cropRecipeController.updateRecipe);

// Delete crop recipe
router.delete('/:id', cropRecipeController.deleteRecipe);

// Clone existing recipe
router.post('/:id/clone', cropRecipeController.cloneRecipe);

// Get recipe by crop type
router.get('/type/:cropType', cropRecipeController.getRecipesByCropType);

// Validate recipe for a specific zone
router.post('/:id/validate', cropRecipeController.validateRecipeForZone);

module.exports = router;


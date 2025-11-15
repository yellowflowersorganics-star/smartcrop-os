/**
 * CropWise - Crop Recipe Controller
 */

const { CropRecipe } = require('../models');
const RecipeEngine = require('../services/recipeEngine');
const logger = require('../utils/logger');

class CropRecipeController {
  // Get all public recipes
  async getPublicRecipes(req, res) {
    try {
      const recipes = await CropRecipe.findAll({
        where: { isPublic: true },
        attributes: { exclude: ['authorId'] }
      });

      res.json({
        success: true,
        data: recipes
      });
    } catch (error) {
      logger.error('Error fetching public recipes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recipes'
      });
    }
  }

  // Get public recipe by ID
  async getPublicRecipeById(req, res) {
    try {
      const recipe = await CropRecipe.findOne({
        where: { 
          id: req.params.id,
          isPublic: true
        }
      });

      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }

      res.json({
        success: true,
        data: recipe
      });
    } catch (error) {
      logger.error('Error fetching recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recipe'
      });
    }
  }

  // Get all recipes for authenticated user
  async getAllRecipes(req, res) {
    try {
      const recipes = await CropRecipe.findAll({
        where: { 
          authorId: req.userId 
        }
      });

      res.json({
        success: true,
        data: recipes
      });
    } catch (error) {
      logger.error('Error fetching recipes:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recipes'
      });
    }
  }

  // Get recipe by ID
  async getRecipeById(req, res) {
    try {
      const recipe = await CropRecipe.findOne({
        where: { 
          id: req.params.id
        }
      });

      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }

      // Check if user has access
      if (recipe.authorId !== req.userId && !recipe.isPublic) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: recipe
      });
    } catch (error) {
      logger.error('Error fetching recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recipe'
      });
    }
  }

  // Create new recipe
  async createRecipe(req, res) {
    try {
      const recipeData = req.validatedData;
      
      // Calculate total duration
      const totalDuration = recipeData.stages.reduce((sum, stage) => sum + stage.duration, 0);
      
      const recipe = await CropRecipe.create({
        ...recipeData,
        authorId: req.userId,
        totalDuration
      });

      res.status(201).json({
        success: true,
        data: recipe,
        message: 'Recipe created successfully'
      });
    } catch (error) {
      logger.error('Error creating recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create recipe'
      });
    }
  }

  // Update recipe
  async updateRecipe(req, res) {
    try {
      const recipe = await CropRecipe.findOne({
        where: { 
          id: req.params.id,
          authorId: req.userId
        }
      });

      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }

      const recipeData = req.validatedData;
      const totalDuration = recipeData.stages.reduce((sum, stage) => sum + stage.duration, 0);

      await recipe.update({
        ...recipeData,
        totalDuration
      });

      res.json({
        success: true,
        data: recipe,
        message: 'Recipe updated successfully'
      });
    } catch (error) {
      logger.error('Error updating recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update recipe'
      });
    }
  }

  // Delete recipe
  async deleteRecipe(req, res) {
    try {
      const recipe = await CropRecipe.findOne({
        where: { 
          id: req.params.id,
          authorId: req.userId
        }
      });

      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }

      await recipe.destroy();

      res.json({
        success: true,
        message: 'Recipe deleted successfully'
      });
    } catch (error) {
      logger.error('Error deleting recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete recipe'
      });
    }
  }

  // Clone recipe
  async cloneRecipe(req, res) {
    try {
      const originalRecipe = await CropRecipe.findByPk(req.params.id);

      if (!originalRecipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }

      const clonedRecipe = await CropRecipe.create({
        ...originalRecipe.toJSON(),
        id: undefined,
        cropId: `${originalRecipe.cropId}-clone-${Date.now()}`,
        cropName: `${originalRecipe.cropName} (Clone)`,
        authorId: req.userId,
        isPublic: false,
        createdAt: undefined,
        updatedAt: undefined
      });

      res.status(201).json({
        success: true,
        data: clonedRecipe,
        message: 'Recipe cloned successfully'
      });
    } catch (error) {
      logger.error('Error cloning recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to clone recipe'
      });
    }
  }

  // Get recipes by crop type
  async getRecipesByCropType(req, res) {
    try {
      const recipes = await CropRecipe.findAll({
        where: { 
          cropType: req.params.cropType
        }
      });

      res.json({
        success: true,
        data: recipes
      });
    } catch (error) {
      logger.error('Error fetching recipes by type:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch recipes'
      });
    }
  }

  // Validate recipe for zone
  async validateRecipeForZone(req, res) {
    try {
      const recipe = await CropRecipe.findByPk(req.params.id);
      
      if (!recipe) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found'
        });
      }

      const validation = RecipeEngine.validateRecipe(recipe, req.body.zoneCapabilities);

      res.json({
        success: true,
        data: validation
      });
    } catch (error) {
      logger.error('Error validating recipe:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate recipe'
      });
    }
  }
}

module.exports = new CropRecipeController();


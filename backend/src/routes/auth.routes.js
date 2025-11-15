/**
 * CropWise - Authentication Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

// Register new user
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Google OAuth
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Logout (protected)
router.post('/logout', authenticate, authController.logout);

// Get current user profile (protected)
router.get('/me', authenticate, authController.getCurrentUser);

// Update profile (protected)
router.put('/profile', authenticate, authController.updateProfile);

// Change password (protected)
router.post('/change-password', authenticate, authController.changePassword);

// Password reset request
router.post('/forgot-password', authController.forgotPassword);

// Password reset confirmation
router.post('/reset-password', authController.resetPassword);

module.exports = router;


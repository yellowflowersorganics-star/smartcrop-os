/**
 * SmartCrop OS - Authentication Controller
 */

const { User } = require('../models');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');
const { OAuth2Client } = require('google-auth-library');

class AuthController {
  constructor() {
    // Bind all methods to preserve 'this' context
    this.register = this.register.bind(this);
    this.login = this.login.bind(this);
    this.getCurrentUser = this.getCurrentUser.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.logout = this.logout.bind(this);
    this.updateProfile = this.updateProfile.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.forgotPassword = this.forgotPassword.bind(this);
    this.resetPassword = this.resetPassword.bind(this);
    this.googleAuth = this.googleAuth.bind(this);
    this.googleCallback = this.googleCallback.bind(this);
    
    // Initialize Google OAuth client
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/google/callback'
    );
  }

  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );
  }

  // Register new user
  async register(req, res) {
    try {
      const { email, password, firstName, lastName, phone, organizationName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }

      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
        phone,
        organizationName
      });

      const token = this.generateToken(user.id);

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          token
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed'
      });
    }
  }

  // Login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is inactive'
        });
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      const token = this.generateToken(user.id);

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed'
      });
    }
  }

  // Get current user
  async getCurrentUser(req, res) {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }
      });

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user'
      });
    }
  }

  // Refresh token
  async refreshToken(req, res) {
    try {
      const token = this.generateToken(req.userId);
      
      res.json({
        success: true,
        data: { token }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  // Logout (placeholder - implement token blacklist with Redis)
  async logout(req, res) {
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }

  // Update profile
  async updateProfile(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      const { firstName, lastName, phone, organizationName, preferences } = req.body;

      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
        phone: phone || user.phone,
        organizationName: organizationName || user.organizationName,
        preferences: preferences || user.preferences
      });

      res.json({
        success: true,
        data: user,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      logger.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        message: 'Profile update failed'
      });
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findByPk(req.userId);

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      await user.update({ password: newPassword });

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Password change error:', error);
      res.status(500).json({
        success: false,
        message: 'Password change failed'
      });
    }
  }

  // Forgot password (placeholder - implement with email service)
  async forgotPassword(req, res) {
    res.json({
      success: true,
      message: 'Password reset link sent to email'
    });
  }

  // Reset password
  async resetPassword(req, res) {
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  }

  // Google OAuth - Initiate
  async googleAuth(req, res) {
    try {
      const authorizeUrl = this.googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email'
        ],
        prompt: 'consent'
      });
      
      res.redirect(authorizeUrl);
    } catch (error) {
      logger.error('Google auth initiation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate Google authentication'
      });
    }
  }

  // Google OAuth - Callback
  async googleCallback(req, res) {
    try {
      const { code } = req.query;

      if (!code) {
        return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=no_code`);
      }

      // Exchange code for tokens
      const { tokens } = await this.googleClient.getToken(code);
      this.googleClient.setCredentials(tokens);

      // Get user info from Google
      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });

      const payload = ticket.getPayload();
      const googleId = payload.sub;
      const email = payload.email;
      const firstName = payload.given_name || '';
      const lastName = payload.family_name || '';

      // Check if user exists
      let user = await User.findOne({ where: { email } });

      if (!user) {
        // Create new user
        user = await User.create({
          email,
          firstName,
          lastName,
          googleId,
          isActive: true,
          // No password for Google OAuth users
          password: Math.random().toString(36).slice(-16) // Random password they won't use
        });
      } else if (!user.googleId) {
        // Link Google account to existing user
        await user.update({ googleId });
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Redirect to frontend with token
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/auth/google/success?token=${token}`);
    } catch (error) {
      logger.error('Google callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:8080'}/login?error=google_auth_failed`);
    }
  }
}

module.exports = new AuthController();


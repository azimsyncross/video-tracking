const crypto = require('crypto');
const User = require('../models/user');
const { sendEmail } = require('../utils/email');
const { generateToken, invalidateToken, invalidateAllUserTokens } = require('../utils/jwt');
const { ValidationError, AuthenticationError } = require('../utils/customErrors');

class AuthService {
  static async register(userData) {
    const { username, email, password } = userData;

    if (!username || !email || !password) {
      throw new ValidationError('Please provide all required fields');
    }

    const user = await User.create({ username, email, password });
    const token = await generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  static async login(credentials) {
    const { email, password } = credentials;

    if (!email || !password) {
      throw new ValidationError('Please provide email and password');
    }

    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      throw new AuthenticationError('Invalid email or password');
    }

    const token = await generateToken(user._id);

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }

  static async logout(token) {
    if (token) {
      await invalidateToken(token);
    }
  }

  static async logoutAll(userId) {
    await invalidateAllUserTokens(userId);
  }

  static async forgotPassword(email, protocol, host) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ValidationError('No user found with this email');
    }

    const resetToken = user.createResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${protocol}://${host}/api/auth/reset-password/${resetToken}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>Please click on the following link to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Request',
      html,
    });

    return resetToken;
  }

  static async resetPassword(token, newPassword) {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return user;
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId);

    if (!(await user.comparePassword(currentPassword))) {
      throw new AuthenticationError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    return user;
  }

  static async sendLoginCode(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new ValidationError('No user found with this email');
    }

    const loginCode = user.createLoginCode();
    await user.save({ validateBeforeSave: false });

    const html = `
      <h1>Login Code</h1>
      <p>Your login code is: <strong>${loginCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: 'Login Code',
      html,
    });

    return loginCode;
  }

  static async verifyLoginCode(email, code) {
    const user = await User.findOne({
      email,
      loginCode: code,
      loginCodeExpire: { $gt: Date.now() },
    });

    if (!user) {
      throw new AuthenticationError('Invalid or expired login code');
    }

    const token = await generateToken(user._id);

    user.loginCode = undefined;
    user.loginCodeExpire = undefined;
    await user.save();

    return {
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    };
  }
}

module.exports = AuthService; 
const AuthService = require('../services/authService');
const { successResponse } = require('../utils/responseHandler');

exports.register = async (req, res, next) => {
  try {
    const result = await AuthService.register(req.body);
    return successResponse(res, 201, 'Registration successful', result);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await AuthService.login(req.body);
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    await AuthService.logout(token);
    return successResponse(res, 200, 'Logout successful');
  } catch (error) {
    next(error);
  }
};

exports.logoutAll = async (req, res, next) => {
  try {
    await AuthService.logoutAll(req.user.id);
    return successResponse(res, 200, 'Logged out from all devices');
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    await AuthService.forgotPassword(
      req.body.email,
      req.protocol,
      req.get('host')
    );
    return successResponse(res, 200, 'Password reset email sent');
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    await AuthService.resetPassword(req.params.token, req.body.password);
    return successResponse(res, 200, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user.id, currentPassword, newPassword);
    return successResponse(res, 200, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

exports.loginWithCode = async (req, res, next) => {
  try {
    await AuthService.sendLoginCode(req.body.email);
    return successResponse(res, 200, 'Login code sent to email');
  } catch (error) {
    next(error);
  }
};

exports.verifyLoginCode = async (req, res, next) => {
  try {
    const result = await AuthService.verifyLoginCode(req.body.email, req.body.code);
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
}; 
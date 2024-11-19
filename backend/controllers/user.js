const UserService = require('../services/userService');
const { successResponse } = require('../utils/responseHandler');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await UserService.getProfile(req.user.id);
    return successResponse(res, 200, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = await UserService.updateProfile(req.user.id, req.body);
    return successResponse(res, 200, 'Profile updated successfully', user);
  } catch (error) {
    next(error);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await UserService.deleteAccount(req.user.id);
    return successResponse(res, 200, 'Account deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.getUserStats = async (req, res, next) => {
  try {
    const stats = await UserService.getUserStats(req.user.id);
    return successResponse(res, 200, 'User stats retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
}; 
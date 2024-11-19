const SuperAdminService = require('../services/superAdminService');
const { successResponse } = require('../utils/responseHandler');
const logger = require('../utils/logger');

exports.initialize = async (req, res, next) => {
  try {
    const result = await SuperAdminService.initialize(req.body);
    logger.info('Super admin initialized');
    return successResponse(res, 201, 'Super admin initialized successfully', result);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await SuperAdminService.login(req.body);
    return successResponse(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

exports.getSystemStats = async (req, res, next) => {
  try {
    const stats = await SuperAdminService.getSystemStats();
    return successResponse(res, 200, 'System stats retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

exports.getSystemLogs = async (req, res, next) => {
  try {
    const { type, limit } = req.query;
    const logs = await SuperAdminService.getSystemLogs(type, parseInt(limit));
    return successResponse(res, 200, 'System logs retrieved successfully', logs);
  } catch (error) {
    next(error);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const users = await SuperAdminService.getAllUsers(
      parseInt(page) || 1,
      parseInt(limit) || 10
    );
    return successResponse(res, 200, 'Users retrieved successfully', users);
  } catch (error) {
    next(error);
  }
}; 
const SuperAdmin = require('../models/superAdmin');
const { verifyToken } = require('../utils/jwt');
const { AuthenticationError } = require('../utils/customErrors');

exports.protectSuperAdmin = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AuthenticationError('Please login to access this resource');
    }

    const decoded = await verifyToken(token);
    const superAdmin = await SuperAdmin.findById(decoded.id);

    if (!superAdmin) {
      throw new AuthenticationError('Not authorized as super admin');
    }

    req.superAdmin = superAdmin;
    next();
  } catch (error) {
    next(error);
  }
};

exports.checkInitialization = async (req, res, next) => {
  try {
    const initialized = await SuperAdmin.exists({ isInitialized: true });
    if (initialized) {
      throw new AuthenticationError('Super admin already initialized');
    }
    next();
  } catch (error) {
    next(error);
  }
}; 
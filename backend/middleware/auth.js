const User = require('../models/user');
const { verifyToken } = require('../utils/jwt');
const { AuthenticationError } = require('../utils/customErrors');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AuthenticationError('Please login to access this resource');
    }

    const decoded = await verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}; 
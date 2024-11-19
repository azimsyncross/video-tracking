const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/variables.config');
const Auth = require('../models/auth');
const { AuthenticationError } = require('./customErrors');

exports.generateToken = async (userId) => {
  try {
    const token = jwt.sign({ id: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
    await Auth.create({ userId, token });
    return token;
  } catch (error) {
    throw new Error('Error generating token');
  }
};

exports.verifyToken = async (token) => {
  try {
    const decoded = jwt.verify(token, jwtSecret);
    const authToken = await Auth.findOne({ token, isValid: true });

    if (!authToken) {
      throw new AuthenticationError('Token is invalid or expired');
    }

    return decoded;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AuthenticationError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
      throw new AuthenticationError('Token has expired');
    }
    throw error;
  }
};

exports.invalidateToken = async (token) => {
  try {
    await Auth.findOneAndUpdate(
      { token },
      { isValid: false },
      { new: true }
    );
  } catch (error) {
    throw new Error('Error invalidating token');
  }
};

exports.invalidateAllUserTokens = async (userId) => {
  try {
    await Auth.updateMany(
      { userId },
      { isValid: false }
    );
  } catch (error) {
    throw new Error('Error invalidating user tokens');
  }
}; 
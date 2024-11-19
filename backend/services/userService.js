const User = require('../models/user');
const { NotFoundError, ValidationError } = require('../utils/customErrors');

class UserService {
  static async getProfile(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async updateProfile(userId, updateData) {
    const { username, email } = updateData;

    // Validate unique fields if they're being updated
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        throw new ValidationError('Email already in use');
      }
    }

    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        throw new ValidationError('Username already in use');
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { username, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return user;
  }

  static async deleteAccount(userId) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  static async getUserStats(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // You can add more stats here
    return {
      accountAge: user.createdAt,
      lastUpdated: user.updatedAt,
      role: user.role,
    };
  }
}

module.exports = UserService; 
const mongoose = require('mongoose');
const { mongoUri } = require('./variables.config');

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB; 
const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync';
  try {
    const conn = await mongoose.connect(uri);
    return conn;
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;

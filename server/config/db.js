const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staffsync';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    return conn;
  } catch (err) {
    if (process.env.VERCEL) {
      throw new Error(`MongoDB connection failed: ${err.message}. Please configure MONGO_URI in your Vercel Dashboard Environment Variables.`);
    }

    if (process.env.NODE_ENV === 'production' || process.env.STRICT_DB === 'true') {
      console.error(`MongoDB Connection Error: ${err.message}`);
      process.exit(1);
    }

    try {
      await mongoose.disconnect();
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!mongod) {
        mongod = await MongoMemoryServer.create();
      }
      const memUri = mongod.getUri();
      const conn = await mongoose.connect(memUri);
      return conn;
    } catch (memErr) {
      console.error(`MongoDB Connection Error: ${err.message}`);
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;

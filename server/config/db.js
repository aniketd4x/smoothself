const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb+srv://akshay44x_db_user:Akshay%407072%23@cluster0.jjgisdc.mongodb.net/smoothself_store?retryWrites=true&w=majority&appName=Cluster0';
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // Do not call process.exit(1) to avoid crashing serverless functions or local servers
  }
};

module.exports = connectDB;

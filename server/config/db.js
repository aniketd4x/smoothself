const { initSupabase, getSupabase, isSupabaseConnected } = require('./supabase');

// Disconnect MongoDB: Do not run Mongoose queries since MongoDB is disconnected
const connectDB = async () => {
  return initSupabase();
};

// MongoDB Mongoose connection is disconnected
const isDBConnected = () => {
  return false;
};

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;
module.exports.getSupabase = getSupabase;
module.exports.initSupabase = initSupabase;
module.exports.isSupabaseConnected = isSupabaseConnected;

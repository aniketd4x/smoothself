const { initSupabase, getSupabase, isSupabaseConnected } = require('./supabase');

// Disconnect MongoDB: MongoDB Atlas connections are deactivated in favor of Supabase
const connectDB = async () => {
  return initSupabase();
};

const isDBConnected = () => {
  return isSupabaseConnected();
};

module.exports = connectDB;
module.exports.isDBConnected = isDBConnected;
module.exports.getSupabase = getSupabase;
module.exports.initSupabase = initSupabase;

const mongoose = require('mongoose');
const dns = require('dns');

// Force the use of Google DNS to resolve MongoDB SRV records (fixes ECONNREFUSED in some networks)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    // Explicitly set connection options to handle common network issues
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000, // Increase timeout to 10s
      family: 4,                      // Force IPv4
    });
    
    console.log(`MongoDB Connected Successfully`);
  } catch (error) {
    console.error(`\n MongoDB Connection Failed: ${error.message}`);
    console.error('\n TROUBLESHOOTING:');
    console.error('1. Ensure your IP is whitelisted in MongoDB Atlas -> Network Access.');
    console.error('2. If you are on a restricted network, try using a Mobile Hotspot.');
    console.error('3. Check if your connection string in .env is correct.');
    
    process.exit(1);
  }
};

module.exports = connectDB;

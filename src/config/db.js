const mongoose = require('mongoose');

module.exports = async function connectDB() {
  try {
    // console.log(process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI, {dbName: 'Shop-Api'});
    // console.log('MongoDB Atlas connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

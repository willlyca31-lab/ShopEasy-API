require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    const email = (process.env.ADMIN_EMAIL || 'admin@shopeasy.com').toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('Admin already exists:', email);
    } else {
      await User.create({
        firstName: 'Admin',
        lastName: 'ShopEasy',
        email,
        password: process.env.ADMIN_PASSWORD || 'Admin1234!',
        role: 'admin',
      });
      console.log('Admin created:', email);
    }
  } catch (err) {
    console.error(err.message);
  } finally {
    await mongoose.disconnect();
  }
})();

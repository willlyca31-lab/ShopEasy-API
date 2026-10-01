require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`ShopEasy API running on port ${PORT}`);
    console.log(`Docs: http://localhost:${PORT}/api-docs`);
  });
});

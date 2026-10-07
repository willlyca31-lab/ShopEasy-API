/**
 * Sample data for ShopEasy (users, categories, products, orders).
 *
 *   npm run seed:sample            -> add the sample data (safe to run many times)
 *   npm run seed:sample -- --reset -> first remove ONLY the sample data, then add it again
 *
 * Why a script instead of a JSON file to import?
 *  - Passwords must be hashed by the User model (bcrypt), which a raw import would skip.
 *  - Orders must point to the real _id of users/products created in the same run.
 *  - It goes through the same Mongoose models/validation as the API, so the data is always valid.
 *
 * It never touches documents that are not in the lists below, so it is safe on a shared database.
 * Requires MONGODB_URI in your .env (same variable the API uses).
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');

const RESET = process.argv.includes('--reset');

// ----------------------------------------------------------------------------
// SAMPLE DATA - edit freely
// ----------------------------------------------------------------------------
const ADMIN = {
  firstName: 'Admin',
  lastName: 'ShopEasy',
  email: (process.env.ADMIN_EMAIL || 'admin@shopeasy.com').toLowerCase(),
  password: process.env.ADMIN_PASSWORD || 'Admin1234!',
  role: 'admin',
};

const CUSTOMER_PASSWORD = 'Customer123!';
const CUSTOMERS = [
  { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
  { firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com' },
  { firstName: 'Amina', lastName: 'Uwase', email: 'amina.uwase@example.com' },
].map((c) => ({ ...c, password: CUSTOMER_PASSWORD, role: 'customer' }));

// "general" is the default category of the Product model, so it must exist.
const CATEGORIES = [
  { name: 'general', description: 'Everything that does not fit elsewhere' },
  { name: 'electronics', description: 'Phones, accessories and gadgets' },
  { name: 'clothing', description: 'Apparel for everyday wear' },
  { name: 'books', description: 'Printed books and notebooks' },
  { name: 'home', description: 'Kitchen and household items' },
  { name: 'sports', description: 'Fitness and outdoor equipment' },
];

// category MUST match a name in CATEGORIES (products link to categories by name)
const PRODUCTS = [
  { name: 'Wireless Mouse', description: 'Ergonomic 2.4GHz wireless mouse', price: 19.99, category: 'electronics', stock: 120 },
  { name: 'Mechanical Keyboard', description: 'Compact keyboard with blue switches', price: 59.9, category: 'electronics', stock: 60 },
  { name: 'USB-C Charger 65W', description: 'Fast charger for laptops and phones', price: 29.5, category: 'electronics', stock: 200 },
  { name: 'Bluetooth Headphones', description: 'Over-ear, 30h battery life', price: 79.0, category: 'electronics', stock: 45 },
  { name: 'Cotton T-Shirt', description: '100% cotton, unisex fit', price: 12.99, category: 'clothing', stock: 300 },
  { name: 'Denim Jacket', description: 'Classic mid-wash denim jacket', price: 54.99, category: 'clothing', stock: 40 },
  { name: 'Running Cap', description: 'Lightweight breathable cap', price: 9.5, category: 'clothing', stock: 150 },
  { name: 'JavaScript: The Good Parts', description: 'Paperback programming book', price: 24.0, category: 'books', stock: 35 },
  { name: 'Spiral Notebook A5', description: '200 pages, ruled', price: 3.75, category: 'books', stock: 500 },
  { name: 'Stainless Steel Bottle', description: '750ml insulated water bottle', price: 18.25, category: 'home', stock: 90 },
  { name: 'Non-stick Frying Pan', description: '28cm pan with lid', price: 32.0, category: 'home', stock: 55 },
  { name: 'LED Desk Lamp', description: 'Dimmable lamp with USB port', price: 27.8, category: 'home', stock: 70 },
  { name: 'Yoga Mat', description: '6mm non-slip mat', price: 21.0, category: 'sports', stock: 80 },
  { name: 'Football Size 5', description: 'Match quality synthetic leather ball', price: 25.0, category: 'sports', stock: 65 },
  { name: 'Gift Card', description: 'Digital gift card (general)', price: 10.0, category: 'general', stock: 999 },
];

// Orders for the sample customers: [customer email, product name, quantity, status]
const ORDERS = [
  ['jane.doe@example.com', 'Wireless Mouse', 2, 'pending'],
  ['jane.doe@example.com', 'Cotton T-Shirt', 3, 'paid'],
  ['jane.doe@example.com', 'Yoga Mat', 1, 'delivered'],
  ['john.smith@example.com', 'Bluetooth Headphones', 1, 'shipped'],
  ['john.smith@example.com', 'Spiral Notebook A5', 10, 'delivered'],
  ['john.smith@example.com', 'Denim Jacket', 1, 'cancelled'],
  ['amina.uwase@example.com', 'Mechanical Keyboard', 1, 'paid'],
  ['amina.uwase@example.com', 'LED Desk Lamp', 2, 'pending'],
];

// ----------------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------------
const log = (...a) => console.log(...a);
const byName = (name) => Category.findOne({ name }).collation({ locale: 'en', strength: 2 });

async function reset(allUsers) {
  const emails = allUsers.map((u) => u.email);
  const users = await User.find({ email: { $in: emails } });
  const ids = users.map((u) => u._id);
  const o = await Order.deleteMany({ userId: { $in: ids } });
  const p = await Product.deleteMany({ name: { $in: PRODUCTS.map((x) => x.name) } });
  const c = await Category.deleteMany({ name: { $in: CATEGORIES.map((x) => x.name) } });
  const u = await User.deleteMany({ email: { $in: emails } });
  log(`Reset: removed ${u.deletedCount} users, ${c.deletedCount} categories, ${p.deletedCount} products, ${o.deletedCount} orders (sample data only).`);
}

async function main() {
  if (!process.env.MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not set. Check your .env file: the variable must be named exactly MONGODB_URI (no spaces around "=").'
    );
  }
  await mongoose.connect(process.env.MONGODB_URI);
  log(`Connected to database "${mongoose.connection.name}"`);
  await Category.init(); // make sure the unique index exists before inserting

  const allUsers = [ADMIN, ...CUSTOMERS];
  if (RESET) await reset(allUsers);

  // --- users (User model hashes the password in its pre-save hook) ---
  let created = 0;
  const userByEmail = {};
  for (const data of allUsers) {
    let user = await User.findOne({ email: data.email });
    if (!user) {
      user = await User.create(data);
      created++;
    }
    userByEmail[data.email] = user;
  }
  log(`Users: ${created} created, ${allUsers.length - created} already existed`);

  // --- categories ---
  created = 0;
  for (const data of CATEGORIES) {
    if (!(await byName(data.name))) {
      await Category.create(data);
      created++;
    }
  }
  log(`Categories: ${created} created, ${CATEGORIES.length - created} already existed`);

  // --- products (matched by name; existing ones are left untouched so test stock is not reset) ---
  created = 0;
  const productByName = {};
  for (const data of PRODUCTS) {
    let product = await Product.findOne({ name: data.name });
    if (!product) {
      product = await Product.create(data);
      created++;
    }
    productByName[data.name] = product;
  }
  log(`Products: ${created} created, ${PRODUCTS.length - created} already existed`);

  // --- orders (only if the sample customers have none yet, so re-running never duplicates) ---
  const customerIds = CUSTOMERS.map((c) => userByEmail[c.email]._id);
  const existingOrders = await Order.countDocuments({ userId: { $in: customerIds } });
  if (existingOrders > 0) {
    log(`Orders: skipped (${existingOrders} already exist for the sample customers; use --reset to rebuild)`);
  } else {
    for (const [email, productName, quantity, status] of ORDERS) {
      const product = productByName[productName];
      await Order.create({
        userId: userByEmail[email]._id,
        productId: product._id,
        quantity,
        total: Number((product.price * quantity).toFixed(2)),
        status,
      });
      // Same rule as the API: stock is reserved by every order except cancelled ones
      // (a cancelled order has already given its stock back).
      if (status !== 'cancelled') {
        await Product.findByIdAndUpdate(product._id, { $inc: { stock: -quantity } });
      }
    }
    log(`Orders: ${ORDERS.length} created`);
  }

  log('\nSample logins:');
  log(`  admin     ${ADMIN.email} / ${ADMIN.password}`);
  CUSTOMERS.forEach((c) => log(`  customer  ${c.email} / ${CUSTOMER_PASSWORD}`));
}

main()
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

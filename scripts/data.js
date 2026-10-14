const CUSTOMER_PASSWORD = 'Customer123!';

const CUSTOMERS = [
  { firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com' },
  { firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com' },
//   { firstName: 'Amina', lastName: 'Uwase', email: 'amina.uwase@example.com' },
].map((c) => ({ ...c, password: CUSTOMER_PASSWORD, role: 'customer' }));

// "general" is the default category of the Product model, so it must exist.
const CATEGORIES = [
  { name: 'general', description: 'Everything that does not fit elsewhere' },
  { name: 'electronics', description: 'Phones, accessories and gadgets' },
//   { name: 'clothing', description: 'Apparel for everyday wear' },
//   { name: 'books', description: 'Printed books and notebooks' },
//   { name: 'home', description: 'Kitchen and household items' },
//   { name: 'sports', description: 'Fitness and outdoor equipment' },
];

// category MUST match a name in CATEGORIES (products link to categories by name)
const PRODUCTS = [
  { name: 'Wireless Mouse', description: 'Ergonomic 2.4GHz wireless mouse', price: 19.99, category: 'electronics', stock: 120 },
  { name: 'Mechanical Keyboard', description: 'Compact keyboard with blue switches', price: 59.9, category: 'electronics', stock: 60 },
//   { name: 'USB-C Charger 65W', description: 'Fast charger for laptops and phones', price: 29.5, category: 'electronics', stock: 200 },
//   { name: 'Bluetooth Headphones', description: 'Over-ear, 30h battery life', price: 79.0, category: 'electronics', stock: 45 },
//   { name: 'Cotton T-Shirt', description: '100% cotton, unisex fit', price: 12.99, category: 'clothing', stock: 300 },
//   { name: 'Denim Jacket', description: 'Classic mid-wash denim jacket', price: 54.99, category: 'clothing', stock: 40 },
//   { name: 'Running Cap', description: 'Lightweight breathable cap', price: 9.5, category: 'clothing', stock: 150 },
//   { name: 'JavaScript: The Good Parts', description: 'Paperback programming book', price: 24.0, category: 'books', stock: 35 },
//   { name: 'Spiral Notebook A5', description: '200 pages, ruled', price: 3.75, category: 'books', stock: 500 },
//   { name: 'Stainless Steel Bottle', description: '750ml insulated water bottle', price: 18.25, category: 'home', stock: 90 },
//   { name: 'Non-stick Frying Pan', description: '28cm pan with lid', price: 32.0, category: 'home', stock: 55 },
//   { name: 'LED Desk Lamp', description: 'Dimmable lamp with USB port', price: 27.8, category: 'home', stock: 70 },
//   { name: 'Yoga Mat', description: '6mm non-slip mat', price: 21.0, category: 'sports', stock: 80 },
//   { name: 'Football Size 5', description: 'Match quality synthetic leather ball', price: 25.0, category: 'sports', stock: 65 },
//   { name: 'Gift Card', description: 'Digital gift card (general)', price: 10.0, category: 'general', stock: 999 },
];

// Orders for the sample customers: [customer email, product name, quantity, status]
const ORDERS = [
  ['jane.doe@example.com', 'Wireless Mouse', 2, 'pending'],
  ['jane.doe@example.com', 'Cotton T-Shirt', 3, 'paid'],
//   ['jane.doe@example.com', 'Yoga Mat', 1, 'delivered'],
//   ['john.smith@example.com', 'Bluetooth Headphones', 1, 'shipped'],
//   ['john.smith@example.com', 'Spiral Notebook A5', 10, 'delivered'],
//   ['john.smith@example.com', 'Denim Jacket', 1, 'cancelled'],
//   ['amina.uwase@example.com', 'Mechanical Keyboard', 1, 'paid'],
//   ['amina.uwase@example.com', 'LED Desk Lamp', 2, 'pending'],
];

module.exports = {ORDERS, CUSTOMERS, CATEGORIES, PRODUCTS}

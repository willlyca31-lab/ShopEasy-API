require('dotenv').config();
const mongoose = require("mongoose");
// const os = require("node:os");
const request = require("supertest");
const app = require("../src/app");
const User =  require('../src/models/User');
const Product =  require('../src/models/Product');
const Order =  require('../src/models/Order');
const Category =  require('../src/models/Category');

const data = require('../scripts/data')

// const { MongoClient } = require("mongodb");

let userData;
let productData;
// Connect to test database before all tests
beforeAll(async () => {
  try{
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopeasy-test';
    await mongoose.connect(mongoUri, {
      dbName: 'mongose-test',
    });
    userData = await User.create( data.CUSTOMERS);
    await Category.create( data.CATEGORIES);
    productData = await Product.create( data.PRODUCTS);
    // await Order.create( data.ORDERS);

  }catch(error){
    console.log("Can't connect to Database: ", error);
  }
}, 150000);

// // Clear database after each test
// afterEach(async () => {
//   try{
//     await User.deleteMany({});
//   }
//   catch(error){
//     console.error("Error Deleting DB: ", error);
//   }
// }, 150000);

// Disconnect after all tests
afterAll(async () => {
  try{
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});

    await mongoose.disconnect();
  }catch(error){
    console.log("Error Disconnecting: ", error);
  }
}, 150000);

describe('GET /users', () => {
  it('should get the users Page', async () => {
    // Insert test data

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    // expect(response.body).toHaveLength(2);
    // console.log("Body: ", response.body)
    expect(response.body.length).toBeGreaterThanOrEqual(2);
  }, 150000);

  it('should return a user by id', async () => {
    // try{
      const user =  await User.create({ firstName: 'Amina', lastName: 'Uwase', email: 'amina.uwase@example.com', password: "CUSTOMER_PASSWORD"});

      //{
      //     _id: '6ace4c4cecb47fbef9f5e5f1',
      //     firstName: 'Emmanuel',
      //     lastName: 'Kingsley',
      //     email: 'eko@mail.com',
      //     role: 'customer',
      //     createdAt: '2026-10-13T15:20:44.671Z',
      //     updatedAt: '2026-10-13T15:20:44.671Z',
      //     __v: 0
      //   };
      const id = user._id;
      const response = await request(app).get(`/api/users/${id}`);
  
      // console.log("id: ", id);
      // console.log("User: ", user);
      expect(response.status).toBe(200);
      // expect(response.body.firstName).toBe('Emmanuel');
    // }catch(error){
    //   console.log('can"t prerform Get by id: ', error)
    // }
    // const user = User.create({"firstName":"Emmanuel","lastName":"Kingsley","email":"eko@mail.com","password":"Passw0rd!"})
  }, 150000);

});

describe('GET /Products', () => {
  it('should get the Product Page', async () => {
    // Insert test data

    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    // console.log("Body: ", response.body)
  }, 150000);

  it('should return a user by id', async () => {
    // try{
      let product;

      try{
        product =  await Product.create(  { name: 'LED Desk Lamp', description: 'Dimmable lamp with USB port', price: 27.8, category: 'home', stock: 70 },);
      }catch(error){
        console.log("Error: ", error)
      }
      const id = product._id;
      const response = await request(app).get(`/api/products/${id}`);
      // console.log(id);

      expect(response.status).toBe(200);
  }, 150000);
})

describe('GET /Categories', () => {
  it('should get the Categories Page', async () => {
    // Insert test data

    const response = await request(app).get('/api/category');

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(2);
    // console.log("Body: ", response.body)
  }, 150000);

  it('Should return a Categories by id', async () => {
      let product;
      try{
        product =  await Category.create({ name: 'sports', description: 'Fitness and outdoor equipment' });
      }catch(error){
        console.log("Error: ", error)
      }
      const id = product._id.toString();
      const response = await request(app).get(`/api/category/${id}`);
      // console.log(userData);
      expect(response.status).toBe(200);
  }, 150000);
})

describe('GET /Orders', () => {
  it('should get the Categories Page', async () => {
    // Insert test data

    const response = await request(app).get('/api/orders');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(0);
    // console.log("Body: ", response.body)
  }, 150000);

  it('Should return a Categories by id', async () => {
      let order;
      try{
        order =  await Order.create({ 'userId': userData[0]._id, productId: productData[0]._id, quantity: 10, total: 50000 });
      }catch(error){
        console.error("Error: ", error)
      }
      // console.log(order);
      const id = order._id.toString();
      const response = await request(app).get(`/api/orders/${id}`);
      expect(response.status).toBe(200);
  }, 150000);
})


// console.log(userdata)

// jest.mock('../models/User')
// describe("GET /api/users/", () => {
//   // let connection;
//   let db; 

//   beforeAll(async () => {
//     await mongoose.connect(globalThis.__MONGO_URI__, {
//       dbname: globalThis.__MONGO_DB_NAME__,
//       // runtimeAdapters: { os },
//     });

//     db = mongoose.connection.db;

//     // await connection.connect();
//     // db = connection.db(globalThis.__MONGO_DB_NAME__);
//   });

//   afterAll(async () => {
//     await mongoose.disconnect();

//     // if (connection){
//     //   await connection.close();
//     // }
//   });

//   beforeEach(async () => {
//     await db.collection("users").deleteMany({});
//   });

//   it("returns all users", async () => {
//     // const user = { _id: "some-user-id", name: "John" };

//     // Seed the database so the GET route has a user to find.
//     // await db.collection("users").insertOne(user);

//     const response = await request(app)
//       .get("/api/users");
//       // .expect(200);
//       // console.log("Status Code: ", response.statusCode)
      
//       const usersFromMongo = await db
//       .collection("users")
//       // .find({})
//       // .toArray();
      
//       console.log("Body: ", response.body)
//       expect(response.statusCode).toEqual(200);
//       expect(response.body).toEqual(usersFromMongo);
//   }, 15000);
  
//   it("returns a user by id", async () => {
//     const user =   {
//       "_id": "6ac1212a30aeb42cda356d2d",
//       "firstName": "Emmanuel",
//       "lastName": "Kingsley",
//       "email": "eko@mail.com",
//       "role": "customer",
//       "createdAt": "2026-10-03T15:37:14.459Z",
//       "updatedAt": "2026-10-03T15:37:14.459Z",
//       "__v": 0
//     }

//     // Seed the database so the GET route has a user to find.
//     // await db.collection("users").insertOne(user);

//     const response = await request(app)
//       .get(`/api/users/${user._id}`)
//       .expect(200);
      
//       // console.log("Status Code: ", response.statusCode)
//       // console.log("Body: ", response.body)


//     // expect(response.body).toEqual(user);
//     expect(response.statusCode).toEqual(200);
//   }, 15000);
// });
// http://192.168.0.200:33455/webclient?action=logout&t=1791909963972




    // it('should return empty array when no users', async () => {
    //   const response = await request(app).get('/api/users');
    //   expect(response.status).toBe(200);
    //   expect(response.body.length).isGreaterThan(2);
    // }, 150000);
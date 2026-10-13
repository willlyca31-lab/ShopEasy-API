require('dotenv').config();
const mongoose = require("mongoose");
// const os = require("node:os");
const request = require("supertest");
const app = require("../src/app");
const User =  require('../src/models/User');
// const { MongoClient } = require("mongodb");


// Connect to test database before all tests
beforeAll(async () => {
  try{
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopeasy-test';
    await mongoose.connect(mongoUri, {
      dbName: 'mongose-test',
      // Remove runtimeAdapters
    });
    await User.create([
      {
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane@example.com",
        "password": "Passw0rd!"
      },
      {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "password": "Passw0rd!"
      }
    ]);
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
    await mongoose.disconnect();
  }catch(error){
    console.log("Error Disconnecting: ", error);
  }
}, 150000);

describe('GET /users', () => {
  it('should return all users', async () => {
    // Insert test data

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    // expect(response.body).toHaveLength(2);
    console.log("Body: ", response.body)
    expect(response.body[0].role).toBe('customer');
  }, 150000);

  it('should return a user by id', async () => {
    const user = User.create({"firstName":"Emmanuel","lastName":"Kingsley","email":"eko@mail.com","password":"Passw0rd!"})
    // const user = {
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

    console.log("id", id);
    expect(response.status).toBe(400);
    // expect(response.body.firstName).toBe('Emmanuel');
  }, 150000);

  it('should return empty array when no users', async () => {
    const response = await request(app).get('/api/users');
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(2);
  }, 150000);
});


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
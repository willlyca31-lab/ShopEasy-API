const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string' } };
const secured = [{ bearerAuth: [] }];
const ok = { 200: { description: 'Success' } };
const json = (name) => ({ required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${name}` } } } });

module.exports = {
  openapi: '3.0.0',
  info: { title: 'ShopEasy API', version: '1.0.0', description: 'RESTful e-commerce API' },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Register: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          password: { type: 'string', minLength: 8 },
        },
      },
      Login: {
        type: 'object',
        required: ['email', 'password'],
        properties: { email: { type: 'string' }, password: { type: 'string' } },
      },
      Product: {
        type: 'object',
        required: ['name', 'price', 'stock'],
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          stock: { type: 'integer' },
        },
      },
      OrderCreate: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: { productId: { type: 'string' }, quantity: { type: 'integer', minimum: 1 } },
      },
      OrderStatus: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] },
        },
      },
    },
  },
  paths: {
    '/api/users': {
      post: { tags: ['Users'], summary: 'Create user (register)', requestBody: json('Register'), responses: { 201: { description: 'Created, returns token and user' } } },
      get: { tags: ['Users'], summary: 'Get users (admin)', security: secured, responses: ok },
    },
    '/api/users/login': {
      post: { tags: ['Users'], summary: 'Login', requestBody: json('Login'), responses: ok },
    },
    '/api/users/{id}': {
      get: { tags: ['Users'], summary: 'Get one user (self or admin)', security: secured, parameters: [idParam], responses: ok },
      put: { tags: ['Users'], summary: 'Update user (self or admin)', security: secured, parameters: [idParam], requestBody: json('Register'), responses: ok },
      delete: { tags: ['Users'], summary: 'Delete user (self or admin)', security: secured, parameters: [idParam], responses: ok },
    },
    '/api/products': {
      get: {
        tags: ['Products'], summary: 'Get all products',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: ok,
      },
      post: { tags: ['Products'], summary: 'Create product (admin)', security: secured, requestBody: json('Product'), responses: { 201: { description: 'Created' } } },
    },
    '/api/products/{id}': {
      get: { tags: ['Products'], summary: 'Get one product', parameters: [idParam], responses: ok },
      put: { tags: ['Products'], summary: 'Update product (admin)', security: secured, parameters: [idParam], requestBody: json('Product'), responses: ok },
      delete: { tags: ['Products'], summary: 'Delete product (admin)', security: secured, parameters: [idParam], responses: ok },
    },
    '/api/orders': {
      get: { tags: ['Orders'], summary: 'Get orders (admin: all, customer: own)', security: secured, responses: ok },
      post: { tags: ['Orders'], summary: 'Create order', security: secured, requestBody: json('OrderCreate'), responses: { 201: { description: 'Created' } } },
    },
    '/api/orders/{id}': {
      get: { tags: ['Orders'], summary: 'Get one order (owner or admin)', security: secured, parameters: [idParam], responses: ok },
      put: { tags: ['Orders'], summary: 'Update order status (admin; owner may cancel pending)', security: secured, parameters: [idParam], requestBody: json('OrderStatus'), responses: ok },
      delete: { tags: ['Orders'], summary: 'Delete order (admin)', security: secured, parameters: [idParam], responses: ok },
    },
  },
};

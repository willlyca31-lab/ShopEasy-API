const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'string', example: '665f1c2e8a1b2c3d4e5f6a7b' } };
const secured = [{ bearerAuth: [] }];
const json = (name) => ({ required: true, content: { 'application/json': { schema: { $ref: `#/components/schemas/${name}` } } } });

const body = (description, schema) => ({
  description,
  content: { 'application/json': { schema } },
});
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const arrayOf = (name) => ({ type: 'array', items: ref(name) });
const err = (code) => ({ $ref: `#/components/responses/${code}` });

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'ShopEasy API',
    version: '1.0.0',
    description:
      'RESTful e-commerce API (Node, Express, MongoDB Atlas).\n\n' +
      '**How to try protected routes:** (1) call `POST /api/users/login`, (2) copy the `token` from the response, ' +
      '(3) click **Authorize** (top right) and paste the token only (no "Bearer " prefix).',
  },
  servers: [{ url: '/' }],
  tags: [
    { name: 'Users', description: 'Registration, login and account management' },
    { name: 'Products', description: 'Product catalogue (writes are admin only)' },
    { name: 'Orders', description: 'Customers manage their own orders; admins manage all orders' },
    { name: 'Category', description: 'Product categories (writes are admin only)' },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },

    responses: {
      400: body('Validation failed or bad request', ref('Error')),
      401: body('Missing, invalid or expired token', ref('Error')),
      403: body('Authenticated but not allowed (wrong role or not the owner)', ref('Error')),
      404: body('Resource not found', ref('Error')),
      409: body('Conflict (e.g. email already in use, or order changed by another request)', ref('Error')),
    },

    schemas: {
      // ---- request bodies ----
      Register: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'password'],
        properties: {
          firstName: { type: 'string', example: 'Jane' },
          lastName: { type: 'string', example: 'Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', minLength: 8, example: 'Passw0rd!' },
        },
      },
      UserUpdate: {
        type: 'object',
        description: 'Send only the fields you want to change.',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          role: { type: 'string', enum: ['customer', 'admin'], description: 'Only applied when the caller is an admin' },
        },
      },
      Login: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@shopeasy.com' },
          password: { type: 'string', example: 'Admin1234!' },
        },
      },
      // Request body for products
      ProductInput: {
        type: 'object',
        required: ['name', 'price', 'stock'],
        properties: {
          name: { type: 'string', example: 'Wireless Mouse' },
          description: { type: 'string', example: 'Ergonomic 2.4GHz mouse' },
          price: { type: 'number', minimum: 0, example: 19.99 },
          category: { type: 'string', example: 'electronics' },
          stock: { type: 'integer', minimum: 0, example: 50 },
        },
      },
      // category request body
      CategoryInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', maxLength: 50, example: 'electronics' },
          description: { type: 'string', maxLength: 200, example: 'Phones, mice, keyboards...' },
        },
      },
      // PUT accepts a partial body
      CategoryUpdate: {
        type: 'object',
        description: 'Send only the fields you want to change. Renaming also renames the category on its products.',
        properties: {
          name: { type: 'string', maxLength: 50 },
          description: { type: 'string', maxLength: 200 },
        },
      },
      OrderCreate: {
        type: 'object',
        required: ['productId', 'quantity'],
        properties: {
          productId: { type: 'string', example: '665f1c2e8a1b2c3d4e5f6a7b' },
          quantity: { type: 'integer', minimum: 1, maximum: 1000, example: 2 },
        },
      },
      OrderStatus: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] },
        },
      },

      // ---- response bodies ----
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'admin'] },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: { token: { type: 'string', description: 'JWT to send as "Authorization: Bearer <token>"' }, user: ref('User') },
      },
      Product: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          stock: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Order: {
        type: 'object',
        description: 'productId / userId are populated objects on GET requests and plain IDs on POST/PUT.',
        properties: {
          _id: { type: 'string' },
          userId: { oneOf: [{ type: 'string' }, { type: 'object', properties: { _id: { type: 'string' }, firstName: { type: 'string' }, lastName: { type: 'string' }, email: { type: 'string' } } }] },
          productId: { oneOf: [{ type: 'string' }, { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' }, price: { type: 'number' } } }] },
          quantity: { type: 'integer' },
          total: { type: 'number', description: 'Calculated by the server: price x quantity' },
          status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Message: { type: 'object', properties: { message: { type: 'string', example: 'Order deleted' } } },
      Error: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Validation failed' },
          errors: { type: 'array', description: 'Present on validation errors', items: { type: 'object' } },
        },
      },
    },
  },

  paths: {
    // ===================== USERS =====================
    '/api/users': {
      post: {
        tags: ['Users'], summary: 'Create user (register)',
        description: 'Public. The role is always "customer". Returns a JWT so the user is logged in straight away.',
        requestBody: json('Register'),
        responses: { 201: body('Created, returns token and user', ref('AuthResponse')), 400: err(400), 409: err(409) },
      },
      get: {
        tags: ['Users'], summary: 'Get users (admin)', security: secured,
        responses: { 200: body('List of users', arrayOf('User')), 401: err(401), 403: err(403) },
      },
    },
    '/api/users/login': {
      post: {
        tags: ['Users'], summary: 'Login', requestBody: json('Login'),
        responses: { 200: body('Token and basic user info', ref('AuthResponse')), 400: err(400), 401: body('Invalid email or password', ref('Error')) },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'], summary: 'Get one user (self or admin)', security: secured, parameters: [idParam],
        responses: { 200: body('The user', ref('User')), 400: err(400), 401: err(401), 403: err(403), 404: err(404) },
      },
      put: {
        tags: ['Users'], summary: 'Update user (self or admin)', security: secured, parameters: [idParam],
        requestBody: json('UserUpdate'),
        responses: { 200: body('Updated user', ref('User')), 400: err(400), 401: err(401), 403: err(403), 404: err(404) },
      },
      delete: {
        tags: ['Users'], summary: 'Delete user (self or admin)', security: secured, parameters: [idParam],
        responses: { 200: body('Deleted', ref('Message')), 400: err(400), 401: err(401), 403: err(403), 404: err(404) },
      },
    },

    // ===================== PRODUCTS =====================
    '/api/products': {
      get: {
        tags: ['Products'], summary: 'Get all products',
        description: 'Public. Supports filtering by category and a case-insensitive name search.',
        parameters: [
          { name: 'search', in: 'query', description: 'Part of the product name', schema: { type: 'string' } },
          { name: 'category', in: 'query', description: 'Exact category', schema: { type: 'string' } },
        ],
        responses: { 200: body('List of products', arrayOf('Product')) },
      },
      post: {
        tags: ['Products'], summary: 'Create product (admin)', security: secured,
        requestBody: json('ProductInput'),
        responses: { 201: body('Created', ref('Product')), 400: err(400), 401: err(401), 403: err(403) },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'], summary: 'Get one product', parameters: [idParam],
        responses: { 200: body('The product', ref('Product')), 400: err(400), 404: err(404) },
      },
      put: {
        tags: ['Products'], summary: 'Update product (admin)', security: secured, parameters: [idParam],
        requestBody: json('ProductInput'),
        responses: { 200: body('Updated product', ref('Product')), 400: err(400), 401: err(401), 403: err(403), 404: err(404) },
      },
      delete: {
        tags: ['Products'], summary: 'Delete product (admin)', security: secured, parameters: [idParam],
        responses: { 200: body('Deleted', ref('Message')), 400: err(400), 401: err(401), 403: err(403), 404: err(404) },
      },
    },

    // ===================== ORDERS =====================
    '/api/orders': {
      get: {
        tags: ['Orders'], summary: 'Get orders (admin: all, customer: own)', security: secured,
        parameters: [
          { name: 'status', in: 'query', description: 'Only return orders with this status',
            schema: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] } },
        ],
        responses: { 200: body('List of orders, newest first', arrayOf('Order')), 400: err(400), 401: err(401) },
      },
      post: {
        tags: ['Orders'], summary: 'Create order', security: secured,
        description: 'The total is calculated by the server and the stock is reduced immediately. ' +
          'Fails with 400 if there is not enough stock and 404 if the product does not exist.',
        requestBody: json('OrderCreate'),
        responses: { 201: body('Created', ref('Order')), 400: err(400), 401: err(401), 404: err(404) },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'], summary: 'Get one order (owner or admin)', security: secured, parameters: [idParam],
        responses: { 200: body('The order', ref('Order')), 400: err(400), 401: err(401), 403: err(403), 404: err(404) },
      },
      put: {
        tags: ['Orders'], summary: 'Update order status (admin; owner may cancel pending)', security: secured, parameters: [idParam],
        description:
          'Admins can set any status. Customers can only cancel their own **pending** orders.\n\n' +
          'Rules: a cancelled order cannot be modified, a delivered order cannot be cancelled, ' +
          'and cancelling puts the units back in stock.',
        requestBody: json('OrderStatus'),
        responses: { 200: body('Updated order', ref('Order')), 400: err(400), 401: err(401), 403: err(403), 404: err(404), 409: err(409) },
      },
      delete: {
        tags: ['Orders'], summary: 'Delete order (admin)', security: secured, parameters: [idParam],
        description: 'Deleting a pending or paid order puts its units back in stock.',
        responses: { 200: body('Deleted', ref('Message')), 400: err(400), 401: err(401), 403: err(403), 404: err(404) },
      },
    },

    // ===================== CATEGORY =====================
    '/api/category': {
      get: {
        tags: ['Category'], summary: 'Get all categories',
        description: 'Public. Sorted alphabetically by name.',
        responses: { 200: body('List of categories', arrayOf('Category')) },
      },
      post: {
        tags: ['Category'], summary: 'Create category (admin)', security: secured,
        requestBody: json('CategoryInput'),
        responses: { 201: body('Created', ref('Category')), 400: err(400), 401: err(401), 403: err(403), 409: err(409) },
      },
    },
    '/api/category/{id}': {
      get: {
        tags: ['Category'], summary: 'Get one category', parameters: [idParam],
        responses: { 200: body('The category', ref('Category')), 400: err(400), 404: err(404) },
      },
      put: {
        tags: ['Category'], summary: 'Update category (admin)', security: secured, parameters: [idParam],
        requestBody: json('CategoryUpdate'),
        responses: { 200: body('Updated category', ref('Category')), 400: err(400), 401: err(401), 403: err(403), 404: err(404), 409: err(409) },
      },
      delete: {
        tags: ['Category'], summary: 'Delete category (admin)', security: secured, parameters: [idParam],
        description: 'Returns 409 if products still use this category.',
        responses: { 200: body('Deleted', ref('Message')), 400: err(400), 401: err(401), 403: err(403), 404: err(404), 409: err(409) },
      },
    },
  },
};

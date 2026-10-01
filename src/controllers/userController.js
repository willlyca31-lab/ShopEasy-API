const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

const publicUser = (u) => ({
  id: u._id,
  firstName: u.firstName,
  lastName: u.lastName,
  email: u.email,
  role: u.role,
});

// POST /api/users  (public) - role is always "customer"
exports.createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.create({ firstName, lastName, email, password, role: 'customer' });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// POST /api/users/login (public)
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    next(err);
  }
};

// GET /api/users (admin)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const isSelfOrAdmin = (req) => req.user.role === 'admin' || req.user.id === req.params.id;

// GET /api/users/:id (self or admin)
exports.getUser = async (req, res, next) => {
  try {
    if (!isSelfOrAdmin(req)) return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/:id (self or admin) - only admins may change role
exports.updateUser = async (req, res, next) => {
  try {
    if (!isSelfOrAdmin(req)) return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findById(req.params.id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    ['firstName', 'lastName', 'email', 'password'].forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });
    if (req.body.role !== undefined && req.user.role === 'admin') user.role = req.body.role;

    await user.save();
    res.json(publicUser(user));
  } catch (err) {
    next(err);
  }
};

// DELETE /api/users/:id (self or admin)
exports.deleteUser = async (req, res, next) => {
  try {
    if (!isSelfOrAdmin(req)) return res.status(403).json({ message: 'Forbidden' });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

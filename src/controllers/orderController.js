const Order = require('../models/Order');
const Product = require('../models/Product');

const isOwnerOrAdmin = (req, order) =>
  req.user.role === 'admin' || order.userId.toString() === req.user.id;

const restoreStock = (productId, quantity) =>
  Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });

// GET /api/orders - admin sees all, customers see only their own
exports.getOrders = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { userId: req.user._id };
    if (req.query.status) filter.status = req.query.status;
    const orders = await Order.find(filter)
      .populate('productId', 'name price')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id - owner or admin
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!isOwnerOrAdmin(req, order)) return res.status(403).json({ message: 'Forbidden' });
     await order.populate([
      { path: 'productId', select: 'name price' },
      { path: 'userId', select: 'firstName lastName email' },
    ]);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// POST /api/orders - total is calculated server-side; stock is reserved atomically
exports.createOrder = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { new: true }
    );
    if (!product) {
      const exists = await Product.exists({ _id: productId });
      return res
        .status(exists ? 400 : 404)
        .json({ message: exists ? 'Insufficient stock' : 'Product not found' });
    }

    let order;
    try {
      order = await Order.create({
        userId: req.user._id,
        productId,
        quantity,
        total: Number((product.price * quantity).toFixed(2)),
      });
    } catch (err) {
      await restoreStock(productId, quantity);
      throw err;
    }
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id - admin may set any status; owners may only cancel a pending order
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (!isOwnerOrAdmin(req, order)) return res.status(403).json({ message: 'Forbidden' });

    const { status } = req.body;
    if (req.user.role !== 'admin' && (status !== 'cancelled' || order.status !== 'pending')) {
      return res.status(403).json({ message: 'Customers can only cancel pending orders' });
    }

    // 1) A cancelled order is final. Re-opening it would need stock to be reserved again.
    if (order.status === 'cancelled') {
      return res.status(400).json({ message: 'A cancelled order cannot be modified' });
    }
    // 2) A delivered order cannot be cancelled (the goods are already with the customer).
    if (status === 'cancelled' && order.status === 'delivered') {
      return res.status(400).json({ message: 'A delivered order cannot be cancelled' });
    }

    if (status === 'cancelled') {
      const cancelled = await Order.findOneAndUpdate(
        { _id: order._id, status: { $nin: ['cancelled', 'delivered'] } },
        { status: 'cancelled' },
        { new: true }
      );
      if (!cancelled) {
        return res.status(409).json({ message: 'Order was changed by another request, please retry' });
      }
      await restoreStock(order.productId, order.quantity);
      return res.json(cancelled);
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/orders/:id (admin)
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (['pending', 'paid'].includes(order.status)) {
      await restoreStock(order.productId, order.quantity);
    }
    res.json({ message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

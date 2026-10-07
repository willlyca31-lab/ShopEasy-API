const router = require('express').Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/orderController');

const idRule = param('id').isMongoId().withMessage('Invalid order ID');

const STATUSES = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

router.use(protect);

router.get(
  '/',
  [query('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`)],
  validate,
  c.getOrders
);
router.get('/:id', idRule, validate, c.getOrder);

router.post(
  '/',
  [
    body('productId').isMongoId().withMessage('productId must be a valid ID'),
    body('quantity').isInt({ min: 1, max: 1000 }).withMessage('quantity must be an integer between 1 and 1000'),
  ],
  validate,
  c.createOrder
);

router.put(
  '/:id',
  [idRule, body('status').isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}`)],
  validate,
  c.updateOrder
);

router.delete('/:id', authorize('admin'), idRule, validate, c.deleteOrder);

module.exports = router;

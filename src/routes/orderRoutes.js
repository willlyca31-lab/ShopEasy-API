const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/orderController');

const idRule = param('id').isMongoId().withMessage('Invalid order ID');

router.use(protect);

router.get('/', c.getOrders);
router.get('/:id', idRule, validate, c.getOrder);

router.post(
  '/',
  [body('productId').isMongoId(), body('quantity').isInt({ min: 1 })],
  validate,
  c.createOrder
);

router.put(
  '/:id',
  [idRule, body('status').isIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])],
  validate,
  c.updateOrder
);

router.delete('/:id', 
  // authorize('admin'),
   idRule, validate, c.deleteOrder);

module.exports = router;

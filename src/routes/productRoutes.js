const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/productController');

const idRule = param('id').isMongoId().withMessage('Invalid product ID');

router.get('/', c.getProducts);
router.get('/:id', idRule, validate, c.getProduct);

router.post(
  '/',
  protect,
  // authorize('admin'),
  [
    body('name').trim().notEmpty(),
    body('description').optional().isString(),
    body('price').isFloat({ min: 0 }),
    body('category').optional().isString(),
    body('stock').isInt({ min: 0 }),
  ],
  validate,
  c.createProduct
);

router.put(
  '/:id',
  protect,
  // authorize('admin'),
  [
    idRule,
    body('name').optional().trim().notEmpty(),
    body('price').optional().isFloat({ min: 0 }),
    body('stock').optional().isInt({ min: 0 }),
  ],
  validate,
  c.updateProduct
);

router.delete('/:id', protect,
  //  authorize('admin'), 
   idRule, validate, c.deleteProduct);

module.exports = router;

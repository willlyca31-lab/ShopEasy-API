const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/categoryController');

const idRule = param('id').isMongoId().withMessage('Invalid category ID');

router.get('/', c.getCategories);
router.get('/:id', idRule, validate, c.getCategory);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('name is required').isLength({ max: 50 }),
    body('description').optional().isString().isLength({ max: 200 }),
  ],
  validate,
  c.createCategory
);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    idRule,
    body('name').optional().trim().notEmpty().withMessage('name cannot be empty').isLength({ max: 50 }),
    body('description').optional().isString().isLength({ max: 200 }),
  ],
  validate,
  c.updateCategory
);

router.delete('/:id', protect, authorize('admin'), idRule, validate, c.deleteCategory);

module.exports = router;

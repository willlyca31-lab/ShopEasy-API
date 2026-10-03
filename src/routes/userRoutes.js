const router = require('express').Router();
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/userController');

const idRule = param('id').isMongoId().withMessage('Invalid user ID');

router.post(
  '/',
  [
    body('firstName').trim().notEmpty(),
    body('lastName').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validate,
  c.createUser
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  c.login
);

router.get('/', protect, 
  // authorize('admin'), 
  c.getUsers);
router.get('/:id', protect, idRule, validate, c.getUser);

router.put(
  '/:id',
  protect,
  [
    idRule,
    body('firstName').optional().trim().notEmpty(),
    body('lastName').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('password').optional().isLength({ min: 8 }),
    body('role').optional().isIn(['customer', 'admin']),
  ],
  validate,
  c.updateUser
);

router.delete('/:id', protect, idRule, validate, c.deleteUser);

module.exports = router;

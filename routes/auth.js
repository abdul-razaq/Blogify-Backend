const express = require('express');
const { body } = require('express-validator');

const authControllers = require('../controllers/auth');
const requireLogin = require('../middlewares/requireLogin');

const router = express.Router();

router.put(
  '/signup',
  [
    body('firstname', 'Firstname is required')
      .trim()
      .isLength({ min: 5 })
      .withMessage('Firstname must be 5 characters or long'),
    body('lastname', 'Lastname is required')
      .trim()
      .isLength({ min: 5, max: 20 })
      .withMessage('Lastname must be 5 characters or long'),
    body('email', 'An email address is required')
      .isLength({ min: 5, max: 20 })
      .trim()
      .isEmail()
      .normalizeEmail(),
    body('password', 'Password is required')
      .isAlphanumeric()
      .isLength({ min: 8 }),
    body('confirm-password', 'Passwords do not match').custom(
      (value, { req }) => {
        return value === req.body.password;
      }
    ),
  ],
  authControllers.signup
);

router.post('/login', authControllers.login);

router.get('/user/status/', requireLogin, authControllers.getUserStatus);

router.patch('/user/status/', requireLogin, authControllers.updateUserStatus);

module.exports = router;

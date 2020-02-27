const express = require('express');
const { body } = require('express-validator');

const authControllers = require('../controllers/auth');

const router = express.Router();

router.put(
  '/signup',
  [
    body('firstname', 'Firstname is required')
      .trim()
      .isLength({ min: 5 }),
    body('lastname', 'Lastname is required')
      .trim()
      .isLength({ min: 5, max: 20 }),
    body('password', 'Password is required')
      .isAlphanumeric()
      .isLength({ min: 8 })
      .custom((value, { req }) => {
        return value === req.body.password;
      }),
  ],
  authControllers.signup
);

router.post(
  '/login',
  [
    body('firstname', 'Firstname is required')
      .trim()
      .isLength({ min: 5 }),
    body('lastname', 'Lastname is required')
      .trim()
      .isLength({ min: 5, max: 20 }),
    body('password', 'Password is required')
      .isAlphanumeric()
      .isLength({ min: 8 }),
  ],
  authControllers.login
);

module.exports = router;

const express = require('express');
const { body } = require('express-validator');

const userControllers = require('../controllers/user');
const requireLogin = require('../middlewares/requireLogin');

const router = express.Router();

router.get('/:userId', requireLogin, userControllers.getUser);

router.delete('/:userId', requireLogin, userControllers.deleteUser);

router.get('/status', requireLogin, userControllers.getUserStatus);

router.patch('/status', requireLogin, userControllers.updateUserStatus);

router.patch(
  '/update',
  requireLogin,
  [
    body('firstname', 'firstname is required'),
    body('lastname', 'firstname is required'),
    body('email', 'email is required')
      .isEmail()
      .normalizeEmail({ all_lowercase: true }),
    body('oldPassword'),
    body('newPassword')
      .custom((value, {req}) => {
        return value === req.body.confirmNewPassword
      })
  ],
  userControllers.updateUser
);

module.exports = router;

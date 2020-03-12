const userRoutes = require('express').Router();
const { body } = require('express-validator');

const userControllers = require('../controllers/user');
const requireLogin = require('../middlewares/requireLogin');

userRoutes.get('/profile', requireLogin, userControllers.userProfile);

userRoutes.get('/:userId', requireLogin, userControllers.getUser);

userRoutes.delete('/:userId', requireLogin, userControllers.deleteUser);

userRoutes.get('/status', requireLogin, userControllers.getUserStatus);

userRoutes.patch('/status', requireLogin, userControllers.updateUserStatus);

userRoutes.patch(
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

module.exports = userRoutes;

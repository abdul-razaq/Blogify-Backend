const authRoutes = require('express').Router();
const { body } = require('express-validator');

const authControllers = require('../controllers/auth');
const requireLogin = require('../middlewares/requireLogin');

const signUpValidationMiddleware = [
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
	body('username', 'A username is required')
		.isLength({ min: 5 })
		.trim(),
	body('password', 'Password is required')
		.isAlphanumeric()
		.isLength({ min: 8 }),
	body('confirm-password', 'Passwords do not match').custom(
		(value, { req }) => {
			return value === req.body.password;
		}
	),
];
authRoutes.put('/signup', signUpValidationMiddleware, authControllers.signup);

authRoutes.post('/login', authControllers.login);

authRoutes.post('/logout', requireLogin, authControllers.logout);

authRoutes.delete('/', requireLogin, authControllers.deleteAccount);

const updatePasswordValidation = [
	body('old_password', 'Old Password is required')
		.isAlphanumeric()
		.isLength({ min: 8 }),
	body('new_password', 'New password is required')
		.isAlphanumeric()
		.isLength({ min: 8 }),
	body('confirm_new_password', 'Confirm new password')
		.isAlphanumeric()
		.isLength({ min: 8 })
		.custom((value, { req }) => {
			return value === req.body.new_password;
		})
		.withMessage('passwords do not match'),
];
authRoutes.post(
	'/password/update',
	requireLogin,
	updatePasswordValidation,
	authControllers.updatePassword
);

module.exports = authRoutes;

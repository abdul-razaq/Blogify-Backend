const { body } = require('express-validator')

module.exports = {
	signUpValidationMiddleware: [
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
		body('gender', 'Gender is required').trim(),
		body('password', 'Password is required')
			.isAlphanumeric()
			.isLength({ min: 8 }),
		body('confirm-password', 'Passwords do not match').custom(
			(value, { req }) => {
				return value === req.body.password
			}
		),
	],
	updatePasswordValidation: [
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
				return value === req.body.new_password
			})
			.withMessage('passwords do not match'),
	],

	createPostValidation: [
		body('title', 'post title is required')
			.isLength({ min: 5 })
			.trim()
			.isString(),
		body('content', 'post content is required').isString().trim(),
		body('category', 'category of the post is required').isString().trim(),
	],
}

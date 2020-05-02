const authRoutes = require('express').Router()

const authControllers = require('../controllers/auth')
const requireLogin = require('../middlewares/requireLogin')
const { signUpValidationMiddleware, updatePasswordValidation } = require('../utils/validations')

authRoutes.put('/signup', signUpValidationMiddleware, authControllers.signup)

authRoutes.post('/login', authControllers.login)

authRoutes.post('/logout', requireLogin, authControllers.logout)

authRoutes.delete('/', requireLogin, authControllers.deleteAccount)

authRoutes.patch(
	'/password/update',
	requireLogin,
	updatePasswordValidation,
	authControllers.updatePassword
)

module.exports = authRoutes

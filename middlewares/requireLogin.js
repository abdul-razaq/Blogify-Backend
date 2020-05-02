const jwt = require('jsonwebtoken')

const User = require('../models/User')

module.exports = async (req, res, next) => {
	const authHeader = req.get('authorization')
	if (!authHeader || typeof authHeader.split(' ')[1] === 'undefined') {
		const error = new Error('Please authenticate!')
		error.statusCode = 403
		return next(error)
	}
	const token = authHeader.split(' ')[1]
	try {
		const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
		if (!decodedToken) {
			const error = new Error('Error decoding token')
			error.statusCode = 400
			throw error
		}
		const { email, userId } = decodedToken
		const authUserExists = await User.findOne({
			_id: userId,
			email: email,
			'tokens.token': token,
		})
		if (!authUserExists) {
			const error = new Error('Invalid token! Please authenticate')
			error.statusCode = 403
			throw error
		}
		req.token = token
		req.email = email
		req.userId = userId
		next()
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

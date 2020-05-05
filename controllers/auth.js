const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
const cloudinary = require('../utils/cloudinaryConfig')

exports.signup = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, check input')
		error.statusCode = 422
		error.data = errors.array().map(error => error.msg)
		return next(error)
	}
	try {
		const userExists = await User.findOne({ email: req.body.email })
		if (userExists) {
			const error = new Error('Email address already taken, choose another one')
			error.statusCode = 422
			throw error
		}
		let result
		if (req.file) {
			const filePath = req.file.path
			result = await cloudinary.uploadImage(filePath, 'profilePictures')
			require('fs').unlinkSync(filePath)
		}
		const user = new User({
			...req.body,
			profilePicture: result ? result.url : undefined,
		})
		await user.save()
		const token = await user.generateToken(
			req.body.email,
			user._id,
			user.isAdmin
		)
		const { exp } = jwt.verify(token, process.env.JWT_SECRET)
		const expiresIn = new Date(0)
		expiresIn.setUTCSeconds(exp)
		res.status(201).json({
			status: 'success',
			data: {
				message: 'User account successfully created',
				userId: user._id,
				token,
				tokenExpiration: expiresIn,
			},
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 500
		return next(error)
	}
}

exports.login = async (req, res, next) => {
	const { email, password } = req.body
	try {
		const user = await User.findOne({ email })
		if (!user) {
			const error = new Error('No user with this email address')
			error.statusCode = 403
			throw error
		}
		const isMatched = await user.confirmPassword(password)
		if (!isMatched) {
			const error = new Error('email address or password is incorrect!')
			error.statusCode = 403
			throw error
		}
		const token = await user.generateToken(email, user._id, user.isAdmin)
		const { exp } = jwt.verify(token, process.env.JWT_SECRET)
		const expiresIn = new Date(0)
		expiresIn.setUTCSeconds(exp)
		res.status(200).json({
			status: 'success',
			data: {
				message: 'Authenticated successfully',
				token,
				userId: user._id,
				tokenExpiration: expiresIn,
			},
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.logout = async (req, res, next) => {
	try {
		const loggedInUser = await User.findOne({
			_id: req.userId,
			email: req.email,
			'tokens.token': req.token,
		})
		loggedInUser.tokens = loggedInUser.tokens.filter(token => {
			return token.token !== req.token
		})
		await loggedInUser.save()
		res.status(200).json({
			status: 'success',
			data: {
				message: 'User successfully logged out',
			},
		})
	} catch (error) {
		if (!error.statusCode) error.statusCode = 403
		return next(error)
	}
}

exports.deleteAccount = async (req, res, next) => {
	const userId = req.userId
	if (!userId) {
		const error = new Error('Not Authorized!')
		error.statusCode = 422
		return next(error)
	}
	try {
		const user = await User.findById(userId)
		if (!user) {
			const error = new Error('User not found')
			error.statusCode = 404
			throw error
		}
		await User.findByIdAndRemove(userId)
		res.status(200).json({ message: 'Account deleted successfully!' })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.updatePassword = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, check input')
		error.statusCode = 422
		error.data = errors.array()
		next(error)
	}
	const { old_password, new_password } = req.body
	try {
		const user = await User.findOne({ _id: req.userId, email: req.email })
		const isMatched = await user.confirmPassword(old_password)
		if (!isMatched) {
			const error = new Error('Password is invalid!')
			error.statusCode = 403
			throw error
		}
		user.password = new_password
		await user.save()
		res.status(200).json({
			status: 'success',
			data: { message: 'Password changed successfully' },
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 403
		}
		next(error)
	}
}

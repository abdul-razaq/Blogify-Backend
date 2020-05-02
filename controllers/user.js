const User = require('../models/User')

const { validationResult } = require('express-validator')

exports.updateUser = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation fails')
		error.statusCode = 422
		error.data = errors.array()
		next(error)
	}
	try {
		const user = await User.findOneAndUpdate(
			{ _id: req.userId, email: req.email },
			{ ...req.body },
			{ lean: true, omitUndefined: true, new: true }
		).select('-__v -tokens -isAdmin -password')
		if (!user) {
			const error = new Error('User does not exist')
			error.statusCode = 404
			throw error
		}
		if (user.isModified('email')) {
			user.tokens = []
			await user.save()
		}
		res.status(201).json({
			status: 'success',
			data: { message: 'User successfully updated', data: user },
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}

exports.userProfile = async (req, res, next) => {
	try {
		const userProfile = await User.findOne({
			_id: req.userId,
			email: req.email,
		})
			.select('-password -__v -_id -isAdmin -tokens -updatedAt')
			.lean(true)
		if (!userProfile) {
			throw new Error('User does not exist!')
		}
		res.status(200).json({
			status: 'success',
			data: { message: 'User profile fetched successfully', data: userProfile },
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 422
		}
		return next(error)
	}
}

exports.deleteUser = async (req, res, next) => {
	try {
		await User.findOneAndDelete({
			_id: req.userId,
			email: req.email,
			'tokens.token': req.token,
		})
		res.status(200).json({
			status: 'success',
			data: { message: 'User deleted successfully!' },
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 422
		}
		return next(error)
	}
}

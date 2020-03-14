const User = require('../models/User');
const Post = require('../models/Post');

const { validationResult } = require('express-validator');

exports.updateUser = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation fails');
		error.statusCode = 422;
		error.data = errors.array();
		next(error);
	}

	const userId = req.userId;
	if (!userId) {
		const error = new Error('Not Authenticated');
		error.statusCode = 422;
		next(error);
	}
	const {
		firstname,
		lastname,
		email,
		oldPassword,
		newPassword,
		confirmNewPassword,
	} = req.body;

	try {
		const user = await User.findById(userId);
		if (oldPassword && newPassword && confirmNewPassword) {
			const isMatched = await user.confirmPassword(oldPassword);
			if (!isMatched) {
				const error = new Error('Passwords do not match');
				error.statusCode = 422;
				throw error;
			}
			user.firstname = firstname;
			user.lastname = lastname;
			user.email = email;
			user.password = newPassword;
			user.save();
			res.status(200).json({ message: 'User updated successfully!' });
		}
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.userProfile = async (req, res, next) => {
	const userId = req.userId;
	if (!userId) {
		const error = new Error('Not Authenticated');
		error.statusCode = 422;
		return next(error);
	}
	try {
		const userProfile = await User.findOne({ _id: userId }).select(
			'-password -__v -posts -_id -isActive'
		);
		if (!userProfile) {
			res.status(404).json({ message: 'No user found' });
		}
		res.status(200).json({ message: 'User profile', data: userProfile });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 422;
		}
		return next(error);
	}
};

exports.deleteAccount = async (req, res, next) => {
	const userId = req.userId;
	if (!userId) {
		const error = new Error('Not Authenticated');
		error.statusCode = 422;
		return next(error);
	}
	try {
		const removePosts = await Post.deleteMany({ creator: userId });
		await User.findByIdAndDelete(userId);
		res.status(200).json({ message: 'User deleted successfully!' });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 422;
		}
		return next(error);
	}
};

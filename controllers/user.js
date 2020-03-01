const User = require('../models/User');
const bcrypt = require('bcryptjs');

const { validationResult } = require('express-validator');

exports.getUser = async (req, res, next) => {
	const { userId } = req.params;

	if (!req.userId && userId !== req.userId) {
		const error = new Error('Unauthorized!');
		error.statusCode = 403;
		throw error;
	}
	try {
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('User does not exist!');
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({
			message: 'User found!',
			data: {
				firstname: user.firstname,
				lastname: user.lastname,
				email: user.email,
				isActive: user.isActive,
			},
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

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
			res.status(201).json({ message: 'User updated successfully!' });
		}
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		console.log(error);
		next(error);
	}
};

exports.deleteUser = async (req, res, next) => {
	const { userId } = req.params;

	if (!req.userId && userId !== req.userId) {
		const error = new Error('Unauthorized!');
		error.statusCode = 403;
		throw error;
	}
	try {
		const user = await User.findById(req.userId);
		if (!user) {
			const error = new Error('Unauthorized to delete user');
			error.statusCode = 404;
			throw error;
		}
		await User.findByIdAndDelete({ _id: req.userId });
		res.status(200).json({ message: 'user deleted successfully!' });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.getUserStatus = async (req, res, next) => {
	const { userId } = req.body;

	if (!req.userId && userId !== req.userId) {
		const error = new Error('Unauthorized!');
		error.statusCode = 403;
		throw error;
	}
	try {
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('No user found');
			error.statusCode = 404;
			throw error;
		}
		// send the status field back to the client
		res
			.status(200)
			.json({ message: 'User status found', userStatus: user.isActive });
	} catch (error) {
		if (!error.statusCode) {
			statusCode = 500;
		}
		next(error);
	}
};

exports.updateUserStatus = async (req, res, next) => {
	// get the userId
	const { userId, newStatus } = req.body;
	// check to see if a user with that id exists
	try {
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('No user found');
			error.statusCode = 404;
			throw error;
		}
		// update the status field
		user.isActive = newStatus;
		await user.save();
		res
			.status(201)
			.json({ message: 'user status updated', userStatus: user.isActive });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

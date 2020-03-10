const { validationResult } = require('express-validator');

const User = require('../models/User');
const generateJWT = require('../utils/generateJWT');

exports.signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, check input');
		error.statusCode = 422;
		error.data = errors.array();
		return next(error);
	}
	const { firstname, lastname, email, password } = req.body;

	try {
		const userDoc = await User.findOne({ email });
		if (userDoc) {
			const error = new Error(
				'Email address already taken, choose another one'
			);
			error.statusCode = 422;
			throw error;
		}
	} catch (error) {
		return next(error);
	}
	try {
		const user = new User({
			firstname,
			lastname,
			email,
			password,
			isActive: true,
			isAdmin: true,
		});
		await user.save();
		const token = generateJWT(email, user._id, 'thisismysecret', '10h');

		res.status(201).json({ message: 'User created', userId: user._id, token });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.login = async (req, res, next) => {
	const { email, password } = req.body;
	let loadedUser;
	try {
		const user = await User.findOne({ email });
		if (!user) {
			const error = new Error('No user with this email address');
			error.statusCode = 422;
			throw error;
		}
		loadedUser = user;
		const isMatched = await user.confirmPassword(password);
		if (!isMatched) {
			const error = new Error('email or password is incorrect!');
			error.statusCode = 401;
			throw error;
		}
		// Generate jsonwebtoken
		const token = generateJWT(email, user._id, 'thisismysecret', '10h');
		res.status(200).json({
			message: 'Authenticated successfully',
			token,
			userId: loadedUser._id.toString(),
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.logout = (req, res, next) => {
	// grab the request header and make sure the user is authenticated
	const authHeader = req.get('Authorization');
	if (!authHeader) {
		const error = new Error('You are not logged in');
		error.statusCode = 401;
		throw error;
	}
	// if the user is authenticated, delete the token in the header
	req.headers.authorization = '';
	res.status(200).json({ message: 'Logged out successfully' });
};

const jsonWebToken = require('jsonwebtoken');
const User = require('../models/User');

const AppError = require('../utils/AppError');

module.exports = async (req, res, next) => {
	const authHeader = req.get('Authorization');

	if (!authHeader) {
		return next(new AppError('Not Authenticated', 403));
	}

	const token = authHeader.split(' ')[1];
	let decodedToken;
	try {
		decodedToken = jsonWebToken.verify(token, 'thisismysecret');
		if (!decodedToken) {
			throw new AppError('Unable to log you in', 500);
		}
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		return next(error);
	}
	const { userId } = decodedToken;
	try {
		const isUserAdmin = User.findOne({ _id: userId, isAdmin: true });
		if (!isUserAdmin) {
			throw new AppError('Cannot Authenticate!', 403);
		}
		req.userId = userId;
		req.isAdmin = true;
		next();
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		return next(error);
	}
};

module.exports = (error, req, res, next) => {
	const {
		statusCode: status = 500,
		message = 'An error has occurred',
		data = null,
	} = error;
	res.status(status).json({ message, data });
};

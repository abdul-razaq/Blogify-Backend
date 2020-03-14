module.exports = class AppError extends Error {
	constructor(
		message = 'An error has occurred',
		statusCode = 500,
		data = null,
		...params
	) {
		super(...params);
		this.message = message;
		this.statusCode = statusCode;
		this.data = data;
	}
};

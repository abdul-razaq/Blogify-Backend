module.exports = (error, req, res, next) => {
	const {
		statusCode: status = 500,
		message = 'An error has occurred',
		data = null,
	} = error
	// data
	// 	? res.status(status).json({ status: 'error', message, data })
	// 	: res.status(status).json({ status: 'error', message })
	res
		.status(status)
		.json({ status: 'error', message, data: data ? data : undefined })
}

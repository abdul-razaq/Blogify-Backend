module.exports = (
  statusCode = 500,
  message = 'An error has occurred',
  data = null
) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.data = data;
  throw error;
};

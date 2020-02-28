const jsonWebToken = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // check to see if the Authorization header is set, by grabbing the authorization header
  const authHeader = req.get('Authorization');
  // if there is no Authorization set in the header throw unauthenticated error
  if (!authHeader) {
    const error = new Error('Not Authenticated');
    error.statusCode = 401;
    throw error;
  }
  // if it is set, extract the token from the header and split it
  const token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    // verify and decode the token with jwt using the secret key
    decodedToken = jsonWebToken.verify(token, 'thisismysecret');
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
  }
  if (!decodedToken) {
    const error = new Error('Not Authenticated');
    error.statusCode = 401;
    throw error;
  }
  // extract the user Id from the decoded token from the payload
  const { userId } = decodedToken;
  // save the authenticated userId in the request object
  req.userId = userId;
  // continue to other middlewares in the middleware stack
  next();
};

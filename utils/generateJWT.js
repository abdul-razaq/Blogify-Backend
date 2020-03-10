const jsonWebToken = require('jsonwebtoken');

// generate json web token
module.exports = (email, id, secret, expiresIn) => {
	const token = jsonWebToken.sign(
		{ email: email, userId: id },
		secret.toString(),
		{ expiresIn: expiresIn }
  );
  return token;
};

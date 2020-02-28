const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');

const User = require('../models/User');

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
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      isActive: true,
      isAdmin: true,
    });
    await user.save();
    res.status(201).json({ message: 'User created', userId: user._id });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  // extract the user details
  const { email, password } = req.body;
  // check to see if the user has an account by checking for existing email address
  let loadedUser;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('No user with this email address registered');
      error.statusCode = 422;
      throw error;
    }
    loadedUser = user;
    // if the user have an account, compare the password entered
    const isMatched = await bcrypt.compare(password, user.password);
    if (isMatched) {
      // Generate jsonwebtoken
      const token = jsonwebtoken.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id,
        },
        'thisismysecret',
        { expiresIn: '1h' }
      );
      // send a response that user is authenticated
      res.status(200).json({
        message: 'Authenticated successfully',
        token,
        userId: loadedUser._id.toString(),
      });
    } else {
      const error = new Error('Invalid password');
      error.statusCode = 422;
      throw error;
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getUserStatus = async (req, res, next) => {
  // grab the userId
  const { userId } = req.body;
  console.log(req.headers);
  // find that user by id
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

exports.logout = (req, res, next) => {
  // grab the request header and make sure the user is authenticated
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    const error = new Error('You are not logged in');
    error.statusCode = 401;
    throw error;
  }
  // if the user is authenticated, delete the token in the header
  delete req.headers.authorization;
  res.status(200).json({ message: 'Logged out successfully' });
};

exports.deleteUser = (req, res, next) => {
  // grab the userId to delete from the Authorization request header
  // check to see if the userId we want to delete exists
  // if it exists, make sure we are authenticated before we can delete a user and the user id matches the currently logged in user
  // delete the user from the database
};

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

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('User does not exist');
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

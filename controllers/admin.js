const User = require('../models/User');
const AppError = require('../utils/AppError');

exports.adminLogin = async (req, res, next) => {
	const { email, password } = req.body;
	const admin = await User.findOne({ email, isAdmin: true });
	if (!admin) {
		return next(new AppError('Forbidden!', 403));
	}
	const isMatched = await admin.confirmPassword(password);
	if (!isMatched) {
		return next(new AppError('email or password is incorrect!'));
	}
	const token = admin.generateToken(email, admin._id);
	res.status(200).json({ message: 'Authenticated successfully', token });
};

exports.getUser = async (req, res, next) => {
	const { userId } = req.params;

	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authorized', 403));
	}
	try {
		const user = await User.findById(userId).select('-__v -posts -password');
		if (!user) {
			throw new AppError('User does not exist!', 404);
		}
		res.status(200).json({
			message: 'User found!',
			data: user,
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.getUserStatus = async (req, res, next) => {
	const { userId } = req.params;

	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authorized', 403));
	}
	try {
		const user = await User.findById(userId).select('isActive isAdmin');
		if (!user) {
			throw new AppError('User does not exist!', 404);
		}
		res.status(200).json({ message: 'User status found', userStatus: user });
	} catch (error) {
		if (!error.statusCode) {
			statusCode = 500;
		}
		next(error);
	}
};

exports.updateUserStatus = async (req, res, next) => {
	const userId = req.params;
	const { isActive, isAdmin } = req.body;
	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authorized', 403));
	}
	try {
		const user = await User.findById(userId).select('isActive isAdmin');
		if (!user) {
			throw new AppError('User does not exist!', 404);
		}
		if (isActive && !isAdmin) {
			user.isActive = isActive;
		} else if (!isActive && isAdmin) {
			user.isAdmin = isAdmin;
		} else {
			user.isActive = isActive;
			user.isAdmin = isAdmin;
		}
		await user.save();
		res.status(201).json({ message: 'user status updated', userStatus: user });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.deleteUser = async (req, res, next) => {
	const userId = req.params;
	if (!req.userId && !req.isAdmin) {
		const error = new Error('Not Authorized');
		error.statusCode = 422;
		return next(error);
	}
	try {
		const removePosts = await Post.deleteMany({ creator: userId });
		await User.findByIdAndDelete(userId);
		res.status(200).json({ message: 'User deleted successfully!' });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 422;
		}
		return next(error);
	}
};

exports.getAPost = async (req, res, next) => {
	const { postId } = req.params;
	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authorized!', 422));
	}
	try {
		const post = await Post.findOne({ _id: postId })
			.select('-__v')
			.populate({ path: 'creator', select: '-__v -posts -password' });
		if (!post) {
			return next(new AppError('Post Not Found!', 404));
		}
		res.status(200).json({
			message: 'Post found',
			post,
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.getAllPosts = async (req, res, next) => {
	const { userId } = req.params;
	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authenticated!', 422));
	}
	try {
		const user = await User.findById(userId);
		const posts = await user
			.populate({ path: 'posts', select: '-creator -__v' })
			.execPopulate();
		if (posts.posts.length === 0) {
			return res.status(417).json({ message: 'This user has no post yet' });
		}
		res.status(200).json({ message: 'Posts found', posts: posts.posts });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.editPost = async (req, res, next) => {
	const { postId } = req.params;
	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authorized!', 422));
	}
	const { category, title, content } = req.body;
	try {
		const post = await Post.findOne({ _id: postId });
		if (!post) {
			return next(new AppError('Not Found!', 404));
		}
		const editedPost = {
			category,
			title,
			content,
		};
		const prevPost = await Post.findOne({ title: editedPost.title });
		if (prevPost) {
			return next(new AppError('Post with this title already exists'));
		}
		await Post.findByIdAndUpdate(postId, editedPost);
		res.status(200).json({ message: 'Post updated' });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.deletePost = async (req, res, next) => {
	const { postId, userId } = req.params;
	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authenticated!', 422));
	}
	try {
		const postToDelete = await Post.find({ _id: postId, creator: userId });
		if (!postToDelete) {
			return next(new AppError('Not Found!', 404));
		}
		const result = await Post.findByIdAndRemove(postId);
		if (!result) {
			return next(new AppError('Not Found!', 404));
		}
		const user = await User.findById(userId);
		user.posts.pull(postId);
		await user.save();
		res.status(200).json({ message: 'Post deleted!' });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.deleteAllPosts = async (req, res, next) => {
	const { userId } = req.params;
	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authenticated!', 422));
	}
	try {
		const user = await User.findById(userId);
		user.posts = [];
		await user.save();
		await Post.deleteMany({ creator: userId });
		res.status(200).json({ message: 'All posts deleted' });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.getAllAdmins = async (req, res, next) => {
	if (!req.userId && !req.isAdmin) {
		return next(new AppError('Not Authenticated!', 422));
	}
	try {
		const admins = (await User.find({ isAdmin: true })).map(admin => admin);
		if (!admins) {
			return next(new AppError('No Admin users found!', 404));
		}
		res.status(200).json({ message: 'Admins found', admins });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

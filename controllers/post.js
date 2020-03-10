const mongoose = require('mongoose');

const Post = require('../models/Post');
const User = require('../models/User');

const { validationResult } = require('express-validator');

exports.createPost = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, check user input');
		error.statusCode = 422;
		error.data = errors.array();
		next(error);
	}
	const { title, content, category } = req.body;
	const userId = req.userId;
	if (!userId) {
		const error = new Error('Not Authenticated!');
		error.statusCode = 422;
		next(error);
	}
	try {
		const user = await User.findById(userId);
		if (!user) {
			const error = new Error('User does not exist!');
			error.statusCode = 404;
			throw error;
		}
		const prevPost = await Post.findOne({ title });
		if (prevPost) {
			const error = new Error('Post with this title already exists');
			error.statusCode = 409;
			throw error;
		}
		const post = new Post({ title, content, category, creator: userId });
		await post.save();
		user.posts.push(post._id);
		await user.save();
		res.status(201).json({ message: 'post created', post });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.editPost = async (req, res, next) => {
	const userId = req.userId;
	const postId = req.params.id;
	if (!userId) {
		const error = new Error('Not Authenticated');
		error.statusCode = 403;
		next(error);
	}
	const { category, title, content } = req.body;
	try {
		const post = await Post.findOne({ _id: postId, creator: userId });
		if (!post) {
			const error = new Error('Post not found');
			error.statusCode = 404;
			throw error;
		}
		const editedPost = {
			category,
			title,
			content,
		};
		const prevPost = await Post.findOne({ title: editedPost.title });
		if (prevPost) {
			const error = new Error('Post with this title already exists');
			error.statusCode = 409;
			throw error;
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
	const userId = req.userId;
	const postId = req.params.id;
	if (!userId) {
		const error = new Error('User not Authenticated');
		error.statusCode = 403;
		next(error);
	}
	try {
		const postToDelete = await Post.find({ _id: postId, creator: userId });
		if (!postToDelete) {
			const error = new Error('Post not found');
			error.statusCode = 404;
			throw error;
		}
		const result = await Post.findByIdAndRemove(postId);
		if (!result) {
			const error = new Error('Post not found');
			error.statusCode = 404;
			throw error;
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

exports.getPost = async (req, res, next) => {
	const userId = req.userId;
	const postId = req.params.id;
	if (!userId) {
		const error = new Error('User not Authenticated!');
		error.statusCode = 403;
		next(error);
	}
	try {
		const post = await Post.findOne({ _id: postId, creator: userId });
		if (!post) {
			const error = new Error('Post not found!');
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({
			message: 'Post found',
			post: {
				_id: post._id,
				category: post.category,
				title: post.title,
				content: post.content,
				createdAt: post.createdAt,
				updatedAt: post.updatedAt,
			},
		});
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

exports.getAllPosts = async (req, res, next) => {
	const userId = req.userId;
	if (!userId) {
		const error = new Error('Not Authenticated!');
		error.statusCode = 403;
		next(error);
	}
	try {
		const user = await User.findById(userId);
		const posts = await user.populate('posts').execPopulate();
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

exports.getFeeds = async (req, res, next) => {
	const { page: currentPage = 1 } = req.query;
	const postsPerPage = 2;
	try {
		const posts = await Post.find()
			.select('-__v -_id')
			.sort({ _id: -1 })
			.skip((currentPage - 1) * postsPerPage)
			.limit(postsPerPage)
			.populate({ path: 'creator', select: 'firstname lastname email' });
		if (!posts) {
			const error = new Error('No more posts');
			error.statusCode = 404;
			throw error;
		}
		res.status(200).json({ message: 'Posts', posts });
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500;
		}
		next(error);
	}
};

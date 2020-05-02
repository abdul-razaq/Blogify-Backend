const { validationResult } = require('express-validator')

const Post = require('../models/Post')
const User = require('../models/User')
const AppError = require('../utils/AppError')

exports.createPost = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, check user input')
		error.statusCode = 422
		const errorsToSend = []
		errors.array().forEach(error => {
			errorsToSend.push(error.msg)
		})
		error.data = errorsToSend
		return next(error)
	}
	try {
		const prevPost = await Post.findOne({ title: req.body.title })
		if (prevPost) {
			return next(new AppError('Post with this title already exists', 409))
		}
		const post = new Post({ ...req.body, author: req.userId })
		await post.save()
		const user = await User.findOne({ _id: req.userId, email: req.email })
		user.posts.unshift({ post: post._id })
		await user.save()
		res.status(201).json({
			status: 'success',
			data: {
				message: 'post created successfully',
				data: post,
			},
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}

exports.editPost = async (req, res, next) => {
	try {
		const post = await Post.findOne({ _id: req.params.id, author: req.userId })
		if (!post) {
			throw new AppError('Post Not Found!', 404)
		}
		const prevPost = await Post.findOne({ title: req.body.title })
		if (prevPost) {
			throw new AppError('Post with this title already exists', 409)
		}
		const editedPost = await Post.findOneAndUpdate(
			{ _id: req.params.id, author: req.userId },
			{ ...req.body, edited: true },
			{ lean: true, new: true, omitUndefined: true, select: '-__v' }
		)
		res
			.status(200)
			.json({
				status: 'success',
				data: { message: 'Post updated successfully', post: editedPost },
			})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.deletePost = async (req, res, next) => {
	try {
		const postToDelete = await Post.find({ _id: postId, creator: userId })
		if (!postToDelete) {
			return next(new AppError('Not Found!', 404))
		}
		const result = await Post.findByIdAndRemove(postId)
		if (!result) {
			return next(new AppError('Not Found!', 404))
		}
		const user = await User.findById(userId)
		user.posts.pull(postId)
		await user.save()
		res.status(200).json({ message: 'Post deleted!' })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.deleteAllPosts = async (req, res, next) => {
	const userId = req.userId
	if (!userId) {
		return next(new AppError('Not Authenticated!', 422))
	}
	try {
		const user = await User.findById(userId)
		user.posts = []
		await user.save()
		await Post.deleteMany({ creator: userId })
		res.status(200).json({ message: 'All posts deleted' })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}

exports.getAPost = async (req, res, next) => {
	const userId = req.userId
	const postId = req.params.id
	if (!userId) {
		return next(new AppError('Not Authenticated!', 422))
	}
	try {
		const post = await Post.findOne({ _id: postId, creator: userId }).select(
			'-__v -creator'
		)
		if (!post) {
			return next(new AppError('Not Found!', 404))
		}
		res.status(200).json({
			message: 'Post found',
			post,
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}

exports.getAllPosts = async (req, res, next) => {
	const userId = req.userId
	if (!userId) {
		return next(new AppError('Not Authenticated!', 422))
	}
	try {
		const user = await User.findById(userId)
		const posts = await user
			.populate({ path: 'posts', select: '-creator -__v' })
			.execPopulate()
		if (posts.posts.length === 0) {
			return res.status(417).json({ message: 'This user has no post yet' })
		}
		res.status(200).json({ message: 'Posts found', posts: posts.posts })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		next(error)
	}
}

exports.getFeeds = async (req, res, next) => {
	const { page: currentPage = '1', category, limit } = req.query
	const postsPerPage = parseInt(limit) || 2

	let posts, total
	try {
		if (category) {
			posts = await Post.find({ category: category.toLowerCase() })
				.select('-__v -_id')
				.sort({ _id: -1 })
				.skip((currentPage - 1) * postsPerPage)
				.limit(postsPerPage)
				.populate({ path: 'creator', select: 'firstname lastname email' })
			total = await Post.countDocuments({ category: category.toLowerCase() })
		} else {
			posts = await Post.find()
				.select('-__v -_id')
				.sort({ _id: -1 })
				.skip((currentPage - 1) * postsPerPage)
				.limit(postsPerPage)
				.populate({ path: 'creator', select: 'firstname lastname email' })
			total = await Post.countDocuments({})
		}
		if (!posts.length) {
			return next(new AppError('Not Found!', 404))
		}
		res.status(200).json({
			message: 'Posts retrieved',
			currentPage,
			posts,
			postsRemaining: total - currentPage * postsPerPage,
			totalPosts: total,
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.getAFeed = async (req, res, next) => {
	const postId = req.params.id
	try {
		const post = await Post.findById(postId)
		res.status(200).json({ post })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.commentOnPost = async (req, res, next) => {
	const userId = req.userId
	const postId = req.params.id
	const { title, body } = req.body
	if (!userId) {
		return next(new AppError('Not Authorized!', 422))
	}
	try {
		const postToComment = await Post.findById(postId)
		if (!postToComment) {
			return next(new AppError('Not Found!', 404))
		}
		postToComment.comments.push({ creator: userId, title, body })
		await postToComment.save()
		res.status(200).json({ message: 'Comment added!' })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.updateCommentOnPost = async (req, res, next) => {
	const userId = req.userId
	const { postId, commentId } = req.params
	if (!userId) {
		return next(new AppError('Not Authorized!', 422))
	}
	const { title, body } = req.body
	const postToEditComment = await Post.findOne({
		_id: postId,
	})
	if (!postToEditComment) {
		return next(new AppError('No post was found!', 404))
	}

	let commentToUpdate = postToEditComment.comments.filter(comment => {
		return (
			comment._id.toString() === commentId.toString() &&
			comment.creator.toString() === userId.toString()
		)
	})
	commentToUpdate = commentToUpdate[0]
	if (!commentToUpdate) {
		return next(new AppError('Unable to update comment', 500))
	}
	if (title && !body) {
		commentToUpdate.title = title
		commentToUpdate.edited = true
		commentToUpdate.dateModified = new Date().toLocaleString()
	} else if (!title && body) {
		commentToUpdate.body = body
		commentToUpdate.edited = true
		commentToUpdate.dateModified = new Date().toLocaleString()
	} else {
		commentToUpdate.title = title
		commentToUpdate.body = body
		commentToUpdate.edited = true
		commentToUpdate.dateModified = new Date().toLocaleString()
	}
	await postToEditComment.save()
	res.status(200).json({ message: 'Comment updated successfully!' })
}

exports.deleteCommentOnPost = async (req, res, next) => {
	const userId = req.userId
	const { postId, commentId } = req.params
	console.log(userId)
	if (!userId) {
		return next(new AppError('Not Authenticated!', 422))
	}
	const postCommentToFilter = await Post.findOne({ _id: postId })
	postCommentToFilter.comments.filter(comment => {
		return (
			comment._id.toString() !== commentId.toString() &&
			comment.creator.toString() !== userId.toString()
		)
	})
	// if (!filteredComment) {
	// 	return next(new AppError('Unable to delete comment', 500));
	// }
	// postCommentToFilter.comments = filteredComment;
	await postCommentToFilter.save()
	res.status(200).json({ message: 'Comment deleted successfully!' })
}

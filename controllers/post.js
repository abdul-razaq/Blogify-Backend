const { validationResult } = require('express-validator')

const Post = require('../models/Post')
const User = require('../models/User')
const AppError = require('../utils/AppError')
const cloudinary = require('../utils/cloudinaryConfig')

exports.createPost = async (req, res, next) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		const error = new Error('Validation failed, check user input')
		error.statusCode = 422
		error.data = errors.array().map(error => error.msg)
		return next(error)
	}
	try {
		const prevPost = await Post.findOne({ title: req.body.title })
		if (prevPost) {
			return next(new AppError('Post with this title already exists', 409))
		}
		let result
		if (req.file) {
			const filePath = req.file.path
			result = await cloudinary.uploadImage(filePath, 'postImages')
			require('fs').unlinkSync(filePath)
		}
		const post = new Post({
			...req.body,
			author: req.userId,
			imageUrl: result ? result.url : undefined,
		})
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

exports.getPost = async (req, res, next) => {
	try {
		const post = await Post.findOne({
			_id: req.params.id,
			author: req.userId,
		}).select('-__v -creator')
		if (!post) {
			throw new AppError('Post not found!', 404)
		}
		res.status(200).json({
			status: 'success',
			data: {
				message: 'Post found',
				post,
			},
		})
	} catch (error) {
		return next(error)
	}
}

exports.getAllPosts = async (req, res, next) => {
	try {
		let posts
		if (req.query.category) {
			const { category } = req.query
			posts = await Post.find({
				author: req.userId,
				category: category,
			}).select('-__v -author')
		} else {
			posts = await Post.find({
				author: req.userId,
			}).select('-__v -author')
		}
		if (posts.length === 0) {
			const error = new Error('No post found!')
			error.statusCode = 404
			throw error
		}
		res
			.status(200)
			.json({ status: 'success', data: { message: 'Found posts', posts } })
	} catch (error) {
		return next(error)
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
		res.status(200).json({
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
		const deletedPost = await Post.findOneAndDelete({
			_id: req.params.id,
			author: req.userId,
		})
		if (!deletedPost) {
			throw new AppError('Post not found', 404)
		}
		const user = await User.findById(req.userId)
		user.posts = user.posts.filter(post => {
			return post.post.toString() !== req.params.id.toString()
		})
		await user.save()
		res.status(200).json({
			status: 'success',
			data: { message: 'Post deleted successfully!' },
		})
	} catch (error) {
		return next(error)
	}
}

exports.getFeeds = async (req, res, next) => {
	const { page: currentPage = '1', category, limit } = req.query
	const postsPerPage = parseInt(limit) || 2

	let posts
	try {
		if (category) {
			posts = await Post.find({ category: category.toLowerCase() })
				.select('-__v')
				.sort({ _id: -1 })
				.skip((currentPage - 1) * postsPerPage)
				.limit(postsPerPage)
				.populate({ path: 'creator', select: 'firstname lastname email' })
		} else {
			posts = await Post.find()
				.select('-__v')
				.sort({ _id: -1 })
				.skip((currentPage - 1) * postsPerPage)
				.limit(postsPerPage)
				.populate({ path: 'creator', select: 'firstname lastname email' })
		}
		const total = posts.length
		if (!posts.length) {
			const error = new Error('Posts not found')
			error.statusCode = 404
			throw error
		}
		res.status(200).json({
			status: 'success',
			data: {
				message: 'Posts retrieved',
				currentPage,
				posts,
				postsRemaining: total - currentPage * postsPerPage,
				totalPosts: total,
			},
		})
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.getAFeed = async (req, res, next) => {
	try {
		const post = await Post.findOne({ _id: req.params.id })
			.select('-__v')
			.lean()
		if (!post) throw new AppError('Post not found', 404)
		res
			.status(200)
			.json({ status: 'success', data: { message: 'Post found!', post } })
	} catch (error) {
		if (!error.statusCode) {
			error.statusCode = 500
		}
		return next(error)
	}
}

exports.likePost = async (req, res, next) => {
	try {
		const postLikes = await Post.findOne({ _id: req.params.id }, 'likes')
		const { likes } = postLikes
		// !likes.some(like => like.user.toString() === req.userId)
		// typeof (likes.find(like => like.user.toString() === req.userId) !== 'undefined')
		if (likes.findIndex(like => like.user.toString() === req.userId) === -1) {
			likes.push({ user: req.userId })
			await postLikes.save()
		} else {
			throw new AppError('User cannot like post more than once!', 403)
		}
		res.status(200).json({
			status: 'success',
			data: { message: 'Post liked successfully!' },
		})
	} catch (error) {
		if (error) return next(error)
	}
}

exports.dislikePost = async (req, res, next) => {
	try {
		const postDisLikes = await Post.findOne({ _id: req.params.id }, 'dislikes')
		const { dislikes } = postDisLikes
		// !dislikes.some(like => like.user.toString() === req.userId)
		// typeof (dislikes.find(like => like.user.toString() === req.userId) !== 'undefined')
		if (
			dislikes.findIndex(like => like.user.toString() === req.userId) === -1
		) {
			dislikes.push({ user: req.userId })
			await postDisLikes.save()
		} else {
			throw new AppError('User cannot dislike post more than once!', 403)
		}
		res.status(200).json({
			status: 'success',
			data: { message: 'Post disliked successfully!' },
		})
	} catch (error) {
		if (error) return next(error)
	}
}

exports.commentOnPost = async (req, res, next) => {
	try {
		const postToComment = await Post.findOne({ _id: req.params.id })
		if (!postToComment) {
			return next(new AppError('Post does not exist!', 404))
		}
		postToComment.comments.push({
			author: req.userId,
			content: req.body.content,
		})
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
	try {
		const post = await Post.findOne({
			_id: req.params.id,
		})
		if (!post) {
			return next(new AppError('Post not found!', 404))
		}
		const commentToUpdate = post.comments.find(
			comment =>
				comment._id.toString() === req.params.commentId &&
				comment.author.toString() === req.userId
		)
		commentToUpdate.edited = true
		commentToUpdate.content = req.body.content
		commentToUpdate.dateModified = new Date().toUTCString()
		await post.save()
	} catch (error) {
		if (error) return next(error)
	}
	res.status(200).json({ message: 'Comment updated successfully!' })
}

exports.deleteCommentOnPost = async (req, res, next) => {
	try {
		const post = await Post.findOne({ _id: req.params.id, author: req.userId })
		if (!post) {
			throw new AppError('Post not found', 404)
		}
		post.comments = post.comments.filter(
			comment => comment._id.toString() !== req.params.commentId
		)
		await post.save()
		res.status(200).json({ message: 'Comment deleted successfully!' })
	} catch (error) {
		if (error) return next(error)
	}
}

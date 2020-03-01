const express = require('express');
const { body } = require('express-validator');

const requireLogin = require('../middlewares/requireLogin');
const postControllers = require('../controllers/post');

const router = express.Router();

router.put(
	'/post',
	requireLogin,
	[
		body('title', 'post title is required')
			.isLength({ min: 2, max: 20 })
			.trim()
			.isString(),
		body('content', 'post content is required')
			.isString()
			.trim(),
	],
	postControllers.createPost
);

router.get('/feeds', postControllers.getFeeds);

router.get('/posts', requireLogin, postControllers.getAllPosts);

router.get('/posts/:id', requireLogin, postControllers.getPost);

router.patch(
	'/posts/:id',
	requireLogin,
	[
		body('category')
			.notEmpty()
			.isLength({ min: 5, max: 10 }),
		body('title')
			.notEmpty()
			.isLength({ min: 5, max: 10 }),
		body('content')
			.notEmpty()
			.isLength({ min: 10 }),
	],
	postControllers.editPost
);

module.exports = router;

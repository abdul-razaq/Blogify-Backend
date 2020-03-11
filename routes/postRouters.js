const postRoutes = require('express').Router();
const { body } = require('express-validator');

const requireLogin = require('../middlewares/requireLogin');
const postControllers = require('../controllers/post');

postRoutes.put(
	'/posts',
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

postRoutes.patch(
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

postRoutes.delete('/posts/:id', requireLogin, postControllers.deletePost);

postRoutes.delete('/posts', requireLogin, postControllers.deleteAllPosts);

postRoutes.get('/posts/:id', requireLogin, postControllers.getAPost);

postRoutes.get('/posts', requireLogin, postControllers.getAllPosts);

postRoutes.get('/feeds', postControllers.getFeeds);

module.exports = postRoutes;

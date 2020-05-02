const postRoutes = require('express').Router()

const requireLogin = require('../middlewares/requireLogin')
const postControllers = require('../controllers/post')
const { createPostValidation } = require('../utils/validations')

postRoutes.put(
	'/posts',
	requireLogin,
	createPostValidation,
	postControllers.createPost
)

postRoutes.patch(
	'/posts/:id',
	requireLogin,
	postControllers.editPost
)

postRoutes.delete('/posts/:id', requireLogin, postControllers.deletePost)

postRoutes.delete('/posts', requireLogin, postControllers.deleteAllPosts)

postRoutes.get('/posts/:id', requireLogin, postControllers.getAPost)

postRoutes.post('/posts/:id', requireLogin, postControllers.commentOnPost)

postRoutes.get('/posts', requireLogin, postControllers.getAllPosts)

postRoutes.get('/feeds', postControllers.getFeeds)

postRoutes.get('/feeds/:id', postControllers.getAFeed)

postRoutes.post('/feeds/:id', requireLogin, postControllers.commentOnPost)

postRoutes.post(
	'/feeds/:postId/:commentId',
	requireLogin,
	postControllers.updateCommentOnPost
)

postRoutes.delete(
	'/feeds/:postId/:commentId',
	requireLogin,
	postControllers.deleteCommentOnPost
)

module.exports = postRoutes

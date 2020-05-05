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

postRoutes.get('/posts', requireLogin, postControllers.getAllPosts)

postRoutes.get('/posts/:id', requireLogin, postControllers.getPost)

postRoutes.patch('/posts/:id', requireLogin, postControllers.editPost)

postRoutes.delete('/posts/:id', requireLogin, postControllers.deletePost)

postRoutes.get('/feeds', postControllers.getFeeds)

postRoutes.get('/feeds/:id', postControllers.getAFeed)

postRoutes.post('/posts/:id/like', requireLogin, postControllers.likePost)

postRoutes.post('/posts/:id/dislike', requireLogin, postControllers.dislikePost)

postRoutes.post(
	'/posts/:id/comment',
	requireLogin,
	postControllers.commentOnPost
)

postRoutes.patch(
	'/posts/:id/comment/:commentId',
	requireLogin,
	postControllers.updateCommentOnPost
)

postRoutes.delete(
	'/posts/:id/comment/:commentId',
	requireLogin,
	postControllers.deleteCommentOnPost
)

module.exports = postRoutes

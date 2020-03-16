// This holds the admin mini-application routes
// The admin is capable of logging is an admin with super privileges
// He can view all posts by any user, he can view all users in the database
// He can edit all posts by any user, he can't edit a user's details but he can view them
// But he can delete users as well as he can delete posts too
// He can update a user's post since he has access to all posts created, for example removing vulgar words and replacing them in a user's title, blog posts
const adminRoutes = require('express').Router();

const adminControllers = require('../controllers/admin');
const requireAdminLogin = require('../middlewares/requireAdminLogin');

adminRoutes.post('/login', adminControllers.adminLogin);

adminRoutes.get('/users/:userId', requireAdminLogin, adminControllers.getUser);

adminRoutes.delete(
	'/users/:userId',
	requireAdminLogin,
	adminControllers.deleteUser
);

adminRoutes.get(
	'/users/status/:userId',
	requireAdminLogin,
	adminControllers.getUserStatus
);

adminRoutes.patch(
	'/users/status/:userId',
	requireAdminLogin,
	adminControllers.updateUserStatus
);

adminRoutes.get(
	'/users/posts/:postId',
	requireAdminLogin,
	adminControllers.getAPost
);

adminRoutes.get(
	'/users/posts/:userId',
	requireAdminLogin,
	adminControllers.getAllPosts
);

adminRoutes.patch(
	'/users/posts/:postId',
	requireAdminLogin,
	adminControllers.editPost
);

adminRoutes.delete(
	'/users/posts/:postId',
	requireAdminLogin,
	adminControllers.deletePost
);

adminRoutes.delete(
	'/users/posts/:userId',
	requireAdminLogin,
	adminControllers.deleteAllPosts
);

module.exports = adminRoutes;

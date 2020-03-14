// This holds the admin mini-application routes
// The admin is capable of logging is an admin with super privileges
// He can view all posts by any user, he can view all users in the database
// He can edit all posts by any user, he can't edit a user's details but he can view them
// But he can delete users as well as he can delete posts too
// He can update a user's post since he has access to all posts created, for example removing vulgar words and replacing them in a user's title, blog posts
const adminRoutes = require('express').Router();

const adminControllers = require('../controllers/admin');

adminRoutes.post('/login');

module.exports = adminRoutes;

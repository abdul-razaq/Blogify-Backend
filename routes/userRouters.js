const userRoutes = require('express').Router()

const userControllers = require('../controllers/user')
const requireLogin = require('../middlewares/requireLogin')

userRoutes.get('/profile', requireLogin, userControllers.userProfile)

userRoutes.delete('/delete', requireLogin, userControllers.deleteUser)

userRoutes.patch('/update', requireLogin, userControllers.updateUser)

module.exports = userRoutes

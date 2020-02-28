const express = require('express');

const userControllers = require('../controllers/user');
const requireLogin = require('../middlewares/requireLogin');

const router = express.Router();

router.get('/:userId', requireLogin, userControllers.getUser);

router.delete('/:userId', requireLogin, userControllers.deleteUser);

router.get('/status', requireLogin, userControllers.getUserStatus);

router.patch('/status', requireLogin, userControllers.updateUserStatus);

module.exports = router;

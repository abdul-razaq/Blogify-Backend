const express = require('express');

const userControllers = require('../controllers/user');
const requireLogin = require('../middlewares/requireLogin');

const router = express.Router();

router.get('/status', requireLogin, userControllers.getUserStatus);

router.patch('/status', requireLogin, userControllers.updateUserStatus);

router.delete('/delete', requireLogin, userControllers.deleteUser);

module.exports = router;

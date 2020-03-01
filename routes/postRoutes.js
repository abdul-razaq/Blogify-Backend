const express = require('express');
const { body } = require('express-validator');

const requireLogin = require('../middlewares/requireLogin');
const postController = require('../controllers/post');

const router = express.Router();

router.put(
  '/post',
  requireLogin,
  [
    body('title', 'post title is required')
      .isLength({ min: 5, max: 20 })
      .trim()
      .isString(),
    body('content', 'post content is required')
      .isString()
      .trim(),
  ],
  postController.createPost
);

router.get('/feeds', postController.getFeeds);

router.get('/post/:id', requireLogin, postController.getPost);

module.exports = router;

const Post = require('../models/Post');
const User = require('../models/User');

const { validationResult } = require('express-validator');

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed, check user input');
    error.statusCode = 422;
    error.data = errors.array();
    next(error);
  }
  const { title, content, category } = req.body;
  const userId = req.userId;
  if (!userId) {
    const error = new Error('Not Authenticated!');
    error.statusCode = 422;
    throw error;
  }
  try {
    // check to see if the user exists in the database
    const user = await User.findById(userId);
    if (!user) {
      const error = new Error('User does not exist!');
      error.statusCode = 404;
      throw error;
    }
    // check if a post with the same title already exists
    const prevPost = await Post.findOne({ title });
    if (prevPost) {
      const error = new Error('Post with this title already exists');
      error.statusCode = 409;
      throw error;
    }
    // create new post and store it in the database
    const post = new Post({ title, content, category, creator: userId });
    await post.save();
    // add this newly created post to the User's posts array
    user.posts.push(post._id);
    await user.save();
    res.status(201).json({ message: 'post created', post });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getFeeds = async (req, res, next) => {
  // This allows every user, authenticated or not to be able to view all posts available
  // Fetch all posts from the database
  // send all posts to the client
  let postsToSend = [];
  try {
    const posts = await Post.find();
    if (!posts) {
      const error = new Error('No post found');
      error.statusCode = 404;
      throw Error;
    }
    console.log(posts);
    res.status(200).json({ message: 'Post found!' });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const userId = req.userId;
  const postId = req.params.id;
  console.log(userId);
  if (!userId) {
    const error = new Error('Not Authenticated!');
    error.statusCode = 403;
    next(error);
  }
  try {
    const post = await Post.findOne({ _id: postId, creator: userId });
    res.status(200).json({
      message: 'Post found',
      post: {
        _id: post._id,
        category: post.category,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};


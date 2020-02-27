const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/blogify';
const PORT = process.env.port || 3000;

const authRouters = require('./routes/auth');

const app = express();

// Middleware configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// General middlewares
// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'POST, PUT, PATCH, GET, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Register Routes Middlewares
app.use('/auth', authRouters);

// General error handling middleware
app.use((error, req, res, next) => {
  const { statusCode: status, message, data } = error;
  res.status(status).json({ message, data });
});

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Application connected to the database successfully');
    app.listen(PORT, () => {
      console.log('Application listening on port' + PORT);
    });
  })
  .catch(err => {
    console.log('Error connecting to database');
  });

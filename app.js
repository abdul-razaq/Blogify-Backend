const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/blogify';
const PORT = process.env.port || 3000;

const app = express();

// Middleware configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Register Routes Middlewares

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

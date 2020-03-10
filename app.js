const express = require('express');
const mongoose = require('mongoose');

const authRouters = require('./routes/authRoutes');
const userRouters = require('./routes/userRoutes');
const postRouters = require('./routes/postRoutes');
const cors = require('./middlewares/cors');
const generalError = require('./middlewares/generalError');
const error404 = require('./middlewares/error404');

const app = express();

// CONSTANTS
const MONGODB_URI = 'mongodb://127.0.0.1:27017/blogify';
app.set('port', 3000);
// TODO: Add request logger middleware
app.use((req, res, next) => {
	const { url, ip, httpVersion, method } = req;
	console.log(method, ip, url, httpVersion);
	next();
});
// Middleware configurations
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// General middlewares
// CORS middleware
app.use(cors);

// Register Routes Middlewares
app.use('/auth', authRouters);
app.use('/users', userRouters);
app.use(postRouters);

// Error 404 middleware
app.use(error404);
// General error handling middleware
app.use(generalError);

mongoose
	.connect(MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('Application connected to the database successfully');
		const port = app.get('port');
		app.listen(port, () => {
			console.log('Application listening on port ' + port);
		});
	})
	.catch(err => {
		console.log('Error connecting to the database');
	});

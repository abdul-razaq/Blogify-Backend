const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const authRouters = require('./routes/authRouters');
const userRouters = require('./routes/userRouters');
const postRouters = require('./routes/postRouters');
const generalError = require('./middlewares/generalError');
const error404 = require('./middlewares/error404');
const adminRouters = require('./routes/adminRouters');

const app = express();
// CONSTANTS
const MONGODB_URI = 'mongodb://127.0.0.1:27017/blogify';

app.set('port', process.env.PORT || 3000);

// TODO: Add request logger middleware and cors middleware
// app.use((req, res, next) => {
// 	const { url, ip, httpVersion, method } = req;
// 	console.log(method, ip, url, httpVersion);
// 	next();
// });
// Middleware configurations
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// General middlewares
// CORS middleware
app.use(cors());

// Register Routes Mini-Application Middlewares
app.use('/auth', authRouters);
app.use('/users', userRouters);
app.use(postRouters);
app.use('/admin', adminRouters);

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

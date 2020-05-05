require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const app = express()

const upload = require('./utils/multerConfig')

app.set('port', process.env.PORT || 3000)

app.use(morgan('dev'))
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/auth', upload.single('profilePicture'), require('./routes/authRouters'))
app.use('/users', require('./routes/userRouters'))
app.use(upload.single('postImage'), require('./routes/postRouters'))
app.use('/admin', require('./routes/adminRouters'))

app.use(require('./middlewares/error404'))
app.use(require('./middlewares/generalError'))

mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true
	})
	.then(() => {
		console.log('Application connected to the database successfully')
		const port = app.get('port')
		app.listen(port, () => {
			console.log('Application listening on port ' + port)
		})
	})
	.catch(() => {
		console.log('Error connecting to the database')
	})

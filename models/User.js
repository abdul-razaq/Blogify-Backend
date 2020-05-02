const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const Post = require('../models/Post')

const UserSchema = new Schema(
	{
		firstname: {
			type: String,
			required: true,
			trim: true,
			index: true,
			lowercase: true,
		},

		lastname: {
			type: String,
			required: true,
			trim: true,
			index: true,
			lowercase: true,
		},

		email: {
			type: String,
			required: true,
			trim: true,
			lowercase: true,
			index: true,
			unique: true,
		},

		password: {
			type: String,
			required: true,
		},

		profilePicture: {
			type: String,
			required: false,
		},

		gender: {
			type: String,
			required: true,
			lowercase: true,
		},

		bio: {
			type: String,
			required: false,
			trim: true,
		},

		isAdmin: {
			type: Boolean,
			required: true,
			default: false,
			select: false,
		},

		posts: [{ post: { type: Schema.Types.ObjectId, ref: 'Post' } }],

		tokens: [
			{
				token: {
					type: String,
					required: true,
					unique: true,
					index: true,
				},
			},
		],
	},
	{ timestamps: true }
)

UserSchema.methods.generateToken = async function (email, id, isAdmin) {
	const user = this
	const token = jwt.sign(
		{ email, userId: id, isAdmin },
		process.env.JWT_SECRET,
		{
			expiresIn: '10h',
		}
	)
	user.tokens.push({ token })
	await user.save()
	return token
}

UserSchema.virtual('fullName').get(function () {
	const user = this
	return `${user.firstname} ${user.lastname}`
})

UserSchema.pre('save', async function (next) {
	const user = this
	if (user.isModified('password')) {
		try {
			const hashedPassword = await bcrypt.hash(user.password, 10)
			user.password = hashedPassword
			next()
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500
			}
			next(error)
		}
	}
})

UserSchema.pre('remove', async function (next) {
	const user = this
	try {
		await Post.deleteMany({ creator: user._id })
		next()
	} catch (error) {
		return next(error)
	}
})

UserSchema.methods.confirmPassword = function (password) {
	const user = this
	return bcrypt.compare(password, user.password)
}

module.exports = mongoose.model('User', UserSchema)

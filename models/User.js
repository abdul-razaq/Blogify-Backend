const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const UserSchema = new Schema({
	firstname: {
		type: String,
		required: true,
		trim: true,
		allowNull: false,
	},

	lastname: {
		type: String,
		required: true,
		trim: true,
		allowNull: false,
	},

	email: {
		type: String,
		required: true,
		allowNull: false,
	},

	password: {
		type: String,
		required: true,
		allowNull: false,
		select: false,
	},

	isActive: {
		type: Boolean,
		required: true,
		allowNull: false,
		default: true,
	},

	isAdmin: {
		type: Boolean,
		required: true,
		allowNull: false,
		default: false,
	},

	posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

UserSchema.virtual('fullName').get(function() {
	const user = this;
	return `${user.firstname} ${user.lastname}`;
});

UserSchema.pre('save', async function(next) {
	const user = this;
	if (user.isModified('password')) {
		try {
			const hashedPassword = await bcrypt.hash(user.password, 10);
			user.password = hashedPassword;
			next();
		} catch (error) {
			if (!error.statusCode) {
				error.statusCode = 500;
			}
			next(error);
		}
	}
});

UserSchema.methods.confirmPassword = function(password) {
	const user = this;
	return bcrypt.compare(password, user.password);
};

module.exports = mongoose.model('User', UserSchema);

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

	username: {
		type: String,
		required: true,
		unique: true,
		allowNull: false,
	},

	bio: {
		type: String,
		required: false,
	},

	dateJoined: {
		type: String,
		default: new Date().toLocaleString(),
	},

	password: {
		type: String,
		required: true,
		allowNull: false,
	},

	isActive: {
		type: Boolean,
		required: true,
		allowNull: false,
		default: true,
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

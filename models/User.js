const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

const throwError = require('../utils/throwError');

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
  },

  isActive: {
    type: Boolean,
    required: true,
    allowNull: false,
  },

  isAdmin: {
    type: Boolean,
    required: true,
    allowNull: false,
  },

  posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

UserSchema.pre('save', async next => {
  try {
    await bcrypt.hash(this.password, 12);
  } catch (error) {
    throwError(500, error.message);
  }
});

module.exports = mongoose.model('User', UserSchema);

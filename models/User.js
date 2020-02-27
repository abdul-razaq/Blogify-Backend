const mongoose = require('mongoose');
const { Schema } = mongoose;

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

module.exports = mongoose.model('User', UserSchema);

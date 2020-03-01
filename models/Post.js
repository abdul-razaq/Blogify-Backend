const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      allowNull: false,
      trim: true,
    },

    content: {
      type: String,
      required: true,
      allowNull: true,
      trim: true,
    },

    category: {
      type: String,
      required: false,
      default: null,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);

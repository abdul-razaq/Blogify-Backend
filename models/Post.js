const mongoose = require('mongoose');
const { Schema } = mongoose.Schema;

const PostSchema = new Schema(
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

    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    category: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);

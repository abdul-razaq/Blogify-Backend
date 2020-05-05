const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},

		content: {
			type: String,
			required: true,
			trim: true,
		},

		imageUrl: {
			type: String,
			required: false,
		},

		author: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},

		category: {
			type: String,
			required: true,
			lowercase: true,
		},

		comments: [
			{
				author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
				content: {
					type: String,
					required: true,
					trim: true,
				},
				dateAdded: {
					type: Date,
					default: new Date().toUTCString(),
					immutable: false,
				},

				edited: {
					type: Boolean,
					default: false,
				},

				dateModified: {
					type: Date,
					required: false,
				},
				required: false,
			},
		],

		likes: [
			{
				user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			},
		],
		dislikes: [
			{
				user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
			},
		],
		edited: {
			type: Boolean,
			default: false,
			required: false,
		},
	},
	{ timestamps: true }
)

module.exports = mongoose.model('Post', PostSchema)

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
			lowercase: true,
		},

		creator: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},

		comments: [
			{
				creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
				title: {
					type: String,
					required: true,
					trim: true,
				},
				body: {
					type: String,
					required: true,
					trim: true,
				},
				dateAdded: {
					type: String,
					default: new Date().toLocaleString(),
				},

				edited: {
					type: Boolean,
					default: false,
					required: false,
				},

				dateModified: {
					type: String,
					required: false,
				},
				required: false,
			},
		],
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);

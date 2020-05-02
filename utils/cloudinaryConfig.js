require('dotenv').config()

const cloudinary = require('cloudinary').v2

cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
})

exports.uploadImage = file => {
	return cloudinary.uploader.upload(file, {
		resource_type: 'image',
		folder: 'profilePictures',
		transformation: {
			width: 500,
			height: 500,
			crop: "fill"
		}
	})
}

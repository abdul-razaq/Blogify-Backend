const multer = require('multer')
const randomstring = require('randomstring')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		cb(
			null,
			randomstring.generate({ length: 12, charset: 'alphabetic' }) +
				'_' +
				file.originalname
		)
	},
})

const allowedImages = ['image/jpeg', 'image/png', 'image/jpg']
const fileFilter = (req, file, cb) => {
	if (allowedImages.includes(file.mimetype)) {
		cb(null, true)
	} else {
		cb({ message: 'Unsupported file format' }, false)
	}
}

module.exports = multer({
	storage,
	limits: { fileSize: 1024 * 1024 },
	fileFilter,
})

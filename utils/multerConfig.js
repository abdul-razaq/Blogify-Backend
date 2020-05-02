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

const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/png' ||
		file.mimetype === 'image/jpg'
	) {
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

const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const MIME_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
    'image/webp': 'webp'
};

const fileUpload = multer({
    limits: { fileSize: 500000 },
    storage: multer.diskStorage({
        destination:(req, file, cb)=>{
            cb(null, 'uploads/images') //telling multer where to store our image
        },
        filename:(req, file, cb)=>{
            const ext = MIME_TYPE_MAP[file.mimetype]
            cb(null, uuidv4() + '.' + ext)
        }
    }),
   fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    if (!isValid) {
        const error = new Error("Invalid file type. Only png, jpeg, jpg, webp allowed.");
        error.status = 422;
        return cb(error, false);
    }
    cb(null, true);
}
})

module.exports = fileUpload;

//All the logic above is to enable multer manage our image
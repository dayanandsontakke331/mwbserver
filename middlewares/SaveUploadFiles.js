const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');

const sanitizePath = (input) => input.replace(/[\s"'`]/g, '');

const fileUpload = ({ where = 'default', fileSize = 5 * 1024 * 1024 }) => {
    const uploadDir = path.join(__dirname, '../static_data/', where);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, uploadDir),
        filename: (req, file, cb) => {
            const ext = path.extname(file.originalname) || `.${mime.extension(file.mimetype)}`;
            const filename = sanitizePath(`${Date.now()}${ext}`);
            cb(null, filename);
        }
    });

    const upload = multer({
        storage,
        limits: { fileSize },
        fileFilter: (req, file, cb) => {
            const allowed = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            cb(null, allowed.includes(file.mimetype));
        }
    }).single('file');

    return (req, res, next) => {
        upload(req, res, (err) => {
            if (err) {
                return res.status(400).json({ error: err.message });
            }

            req.file_path = `/static_data/${where}/${sanitizePath(req.file.filename)}`;
            next();
        });
    };
};

module.exports = fileUpload;

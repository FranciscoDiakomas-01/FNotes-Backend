import multer from 'multer'
import path from 'node:path'

const storage = multer.diskStorage({

    destination(req, file, cb) {
        cb(null, path.join(process.cwd()+ '/src/uploads'))
    },
    filename(req, file, cb) {
        cb(null , Date.now().toString() + path.extname(file.originalname))
    }
})
const upload = multer({ storage })

export default upload

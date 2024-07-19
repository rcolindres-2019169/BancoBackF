import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/uploads'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        const fileNameWithoutExt = file.originalname.split('.').slice(0, -1).join('.');
        const ext = file.originalname.split('.').pop();
        const fileName = `${fileNameWithoutExt}-${Date.now()}.${ext}`;
        cb(null, fileName);
    }
});

// Filtro de archivos
const filter = (req, file, cb) => {
    if (file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type, only JPG, JPEG and PNG is allowed!'), false);
    }
};

export const validateImage = multer({ storage: storage, fileFilter: filter });

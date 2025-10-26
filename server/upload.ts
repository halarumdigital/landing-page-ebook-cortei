import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Criar pasta upload se não existir
// In production (dist/), go up one level. In dev, go up one level from server/
const uploadDir = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '..', 'upload')
  : path.join(process.cwd(), 'upload');

console.log(`[upload] Upload directory: ${uploadDir}`);

if (!fs.existsSync(uploadDir)) {
  console.log(`[upload] Creating upload directory: ${uploadDir}`);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuração do multer para armazenar arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fieldName = file.fieldname; // 'logo' ou 'favicon'
    const ext = path.extname(file.originalname);
    const filename = `${fieldName}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// Validação de tipos de arquivo
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Permitir apenas imagens
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use apenas imagens (JPEG, PNG, GIF, SVG, ICO).'));
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

// Validação para PDFs
const pdfFileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use apenas arquivos PDF.'));
  }
};

export const pdfUpload = multer({
  storage: storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // Limite de 10MB para PDFs
  }
});

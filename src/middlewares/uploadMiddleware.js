// src/middlewares/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ✅ Agora salvando também fora do /src
const uploadDir = path.join(__dirname, '../../public/imagens/exercicios');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('✅ Pasta de upload criada:', uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📁 Salvando arquivo em:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'exercicio-' + uniqueSuffix + path.extname(file.originalname);
    console.log('📝 Nome do arquivo:', filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  console.log('🔍 Tipo do arquivo:', file.mimetype);
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG ou GIF.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

module.exports = upload;

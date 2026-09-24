const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const evidenciasController = require('../controllers/evidencias.controller');
const { authMiddleware, verificarPermiso } = require('../../../middlewares/auth.middleware');

// Directorio de almacenamiento para evidencias originales
const uploadDirectory = path.join(__dirname, '../../../../uploads/evidencias');
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configuración de Multer en Disco: Almacenamiento original sin compresión destructiva
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },
  filename: (req, file, cb) => {
    // Sanitizar nombre conservando extensión y agregando timestamp único
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1e6)}`;
    cb(null, `${baseName}_${uniqueSuffix}${ext}`);
  }
});

// Filtro de tipos de archivo: Fotografías (JPEG, PNG, WEBP) y Documentos PDF
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
  if (allowedMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error(`Tipo de archivo no permitido (${file.mimetype}). Solo se admiten imágenes JPG, PNG, WEBP y documentos PDF.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB por archivo individual
    files: 20 // Hasta 20 fotos/documentos simultáneos
  }
});

/**
 * RUTAS DE CATEGORÍAS
 */
// Listar categorías (pueden verlas quienes tengan permiso de subir o administrar)
router.get('/categorias', authMiddleware, evidenciasController.listarCategorias);

// Crear categoría (Requiere permiso de directivos: 'evidencias.administrar')
router.post('/categorias', authMiddleware, verificarPermiso('evidencias.administrar'), evidenciasController.crearCategoria);

/**
 * RUTAS DE EVIDENCIAS
 */
// Subir evidencias masivas (Permiso 'evidencias.subir')
router.post('/subir', authMiddleware, verificarPermiso('evidencias.subir'), upload.array('archivos', 20), evidenciasController.subirEvidencias);

// Consultar evidencias (Permite a docentes ver lo suyo, y a directivos con 'evidencias.administrar' ver todo con filtros)
router.get('/', authMiddleware, evidenciasController.listarEvidencias);

// Listar maestros con evidencias (Para selector de filtro en directivos)
router.get('/maestros', authMiddleware, verificarPermiso('evidencias.administrar'), evidenciasController.listarMaestros);

// Descargar ZIP con evidencias filtradas
router.get('/descargar-zip', authMiddleware, verificarPermiso('evidencias.administrar'), evidenciasController.descargarZip);

module.exports = router;

import { Router } from "express";
import { testPublication, savePublication, showPublication, deletePublication, publicationsUser, uploadMedia, showMedia, feed } from "../controllers/publication.js";
import { ensureAuth } from '../middlewares/auth.js';
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from 'cloudinary';
import Response from '../models/Response';
import Publication from '../models/Publication';
import { isAuthenticated } from '../middleware/auth';

// Configuración de subida de archivos en Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'publications',
        allowedFormats: ['jpg', 'png', 'jpeg', 'gif'], // formatos permitidos
        public_id: (req, file) => 'publication-' + Date.now(),
    },
});

// Configurar multer con límites de tamaño de archivos
const uploads = multer({
    storage: storage,
    limits: { fileSize: 1 * 1024 * 1024 }, // Limitar tamaño a 1 MB
});

const router = Router();

// Ruta para agregar una respuesta a una publicación
router.post('/response/:publicationId', isAuthenticated, async(req, res) => {
    try {
        const { text } = req.body;
        const userId = req.user._id;
        const publicationId = req.params.publicationId;

        // Verifica si la publicación existe
        const publication = await Publication.findById(publicationId);
        if (!publication) {
            return res.status(404).json({ message: 'Publicación no encontrada' });
        }

        // Crea la nueva respuesta
        const response = new Response({
            text,
            user: userId,
            publication: publicationId,
        });

        // Guarda la respuesta en la base de datos
        await response.save();

        // Agrega la respuesta a la publicación
        publication.responses.push(response._id);
        await publication.save();

        res.status(200).json({ message: 'Respuesta creada', response });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear respuesta' });
    }
});

// Definir rutas de publicación
router.get('/test-publication', ensureAuth, testPublication);
router.post('/new-publication', ensureAuth, savePublication);
router.get('/show-publication/:id', ensureAuth, showPublication);
router.delete('/delete-publication/:id', ensureAuth, deletePublication);
router.get('/publications-user/:id/:page?', ensureAuth, publicationsUser);
router.post('/upload-media/:id', [ensureAuth, uploads.single("file0")], uploadMedia);
router.get('/media/:id', showMedia);
router.get('/feed/:page?', ensureAuth, feed);

// Exportar el Router
export default router;
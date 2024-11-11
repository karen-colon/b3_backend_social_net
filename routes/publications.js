import { Router } from "express";
import { 
  testPublication, 
  savePublication, 
  showPublication, 
  deletePublication, 
  publicationsUser, 
  uploadMedia, 
  showMedia, 
  feed 
} from "../controllers/publication.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;

const router = Router();

// Configure Cloudinary storage for file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "publications",
    allowed_formats: ["jpg", "png", "jpeg", "gif"], // Allowed file formats
    public_id: (req, file) => `publication-${Date.now()}`
  }
});

// Configure multer with file size limit (1 MB)
const uploads = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // Limit size to 1 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Define publication routes with descriptive comments
// Test route for publication functionality
router.get("/test-publication", ensureAuth, testPublication);

// Route to create a new publication
router.post("/new-publication", ensureAuth, savePublication);

// Route to display a specific publication by ID
router.get("/show-publication/:id", ensureAuth, showPublication);

// Route to delete a specific publication by ID
router.delete("/delete-publication/:id", ensureAuth, deletePublication);

// Route to retrieve all publications by a specific user with optional pagination
router.get("/publications-user/:id/:page?", ensureAuth, publicationsUser);

// Route to upload media for a specific publication
router.post("/upload-media/:id", [ensureAuth, uploads.single("file0")], (req, res) => {
  try {
    uploadMedia(req, res);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "File upload failed",
      error: error.message
    });
  }
});

// Route to serve uploaded media by ID
router.get("/media/:id", showMedia);

// Route to retrieve a paginated feed of publications
router.get("/feed/:page?", ensureAuth, feed);

// Export Router
export default router;

import { Router } from "express";
import { followThisUser, followUserIds } from '../services/followServices.js';
import { 
  testUser, 
  register, 
  login, 
  profile, 
  listUsers, 
  updateUser, 
  uploadAvatar, 
  avatar, 
  counters 
} from "../controllers/user.js";
import { ensureAuth } from "../middlewares/auth.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;

const router = Router();

// Configure Cloudinary storage for avatar uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "avatars",
    allowed_formats: ["jpg", "png", "jpeg", "gif"], // Allowed file formats
    public_id: (req, file) => `avatar-${Date.now()}`
  }
});

// Configure multer with file size limit and file type validation
const uploads = multer({
  storage: storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB size limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  }
});

// Define user-related routes with enhanced documentation
/**
 * Test user route to check user endpoint functionality
 */
router.get("/test-user", ensureAuth, testUser);

/**
 * Route to register a new user
 */
router.post("/register", register);

/**
 * Route to log in an existing user
 */
router.post("/login", login);

/**
 * Route to retrieve a user profile by ID
 */
router.get("/profile/:id", ensureAuth, profile);

/**
 * Route to list users with optional pagination
 */
router.get("/list/:page?", ensureAuth, listUsers);

/**
 * Route to update user details
 */
router.put("/update", ensureAuth, updateUser);

/**
 * Route to upload an avatar image for the user
 */
router.post("/upload-avatar", ensureAuth, uploads.single("file0"), (req, res) => {
  try {
    uploadAvatar(req, res);
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Avatar upload failed",
      error: error.message
    });
  }
});

/**
 * Route to retrieve an avatar by user ID
 */
router.get("/avatar/:id", avatar);

/**
 * Route to get follower/following counters by user ID
 */
router.get("/counters/:id?", ensureAuth, counters);

// Export the router for use in the main app
export default router;

import { Router } from "express";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import pkg from "cloudinary";
const { v2: cloudinary } = pkg;

import { ensureAuth } from "../middlewares/auth.js";
import { followThisUser, followUserIds } from '../services/followServices.js';

// Define your controller functions here
const testUser = (req, res) => {
    res.json({ message: "User test successful!" });
};

const register = (req, res) => {
    // Implement registration logic here
    res.json({ message: "User registered successfully!" });
};

const login = (req, res) => {
    // Implement login logic here
    res.json({ message: "User logged in successfully!" });
};

const profile = (req, res) => {
    const userId = req.params.id;
    // Implement logic to get user profile by ID
    res.json({ userId, message: "User profile fetched successfully!" });
};

const listUsers = (req, res) => {
    const page = req.params.page || 1;
    // Implement logic to list users, maybe with pagination
    res.json({ page, message: "Users listed successfully!" });
};

const updateUser = (req, res) => {
    // Implement logic to update user details
    res.json({ message: "User updated successfully!" });
};

const uploadAvatar = (req, res) => {
    // Implement logic to upload avatar
    res.json({ message: "Avatar uploaded successfully!" });
};

const avatar = (req, res) => {
    const userId = req.params.id;
    // Implement logic to fetch avatar by user ID
    res.json({ userId, message: "User avatar fetched successfully!" });
};

const counters = (req, res) => {
    const userId = req.params.id;
    // Implement logic to fetch counters (followers/following)
    res.json({ userId, followers: 10, following: 5, message: "Counters fetched successfully!" });
};

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

// Test user route
router.get("/test-user", ensureAuth, testUser);

// Register route
router.post("/register", register);

// Login route
router.post("/login", login);

// Profile route
router.get("/profile/:id", ensureAuth, profile);

// List users route
router.get("/list/:page?", ensureAuth, listUsers);

// Update user route
router.put("/update", ensureAuth, updateUser);

// Avatar upload route
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

// Avatar retrieval route
router.get("/avatar/:id", avatar);

// Counters route
router.get("/counters/:id?", ensureAuth, counters);

// Export the router for use in the main app
export default router;

require('dotenv').config(); // Cargar las variables de entorno

const express = require('express');
const mongoose = require('mongoose');
const responseRoutes = require('./routes/responseRoutes');
const app = express();

app.use(express.json()); // Para parsear JSON

// Conectar a la base de datos MongoDB usando la URL de la variable de entorno
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Conectado a MongoDB'))
    .catch((err) => console.error('Error al conectar a MongoDB:', err));

// Usar las rutas
app.use('/api', responseRoutes);

// Usar el puerto definido en la variable de entorno, con 3900 como valor predeterminado
const port = process.env.PORT || 3900;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
const express = require('express');
const router = express.Router();
const Response = require('../models/Response');

// Ruta para crear una respuesta
router.post('/responses', async(req, res) => {
    const { postId, userId, text } = req.body;
    try {
        const newResponse = new Response({ postId, userId, text });
        await newResponse.save();
        res.status(201).json(newResponse); // Enviar la respuesta creada como respuesta al cliente
    } catch (error) {
        res.status(500).json({ message: 'Error al crear la respuesta' });
    }
});

module.exports = router;
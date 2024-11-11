const express = require('express');
const router = express.Router();
const Response = require('../models/Response');

// Route to create a response
router.post('/responses', async(req, res) => {
    const { postId, userId, text } = req.body;
    try {
        const newResponse = new Response({ postId, userId, text });
        await newResponse.save();
        res.status(201).json(newResponse); // Send the created response as the response to the client
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating response' });
    }
});

module.exports = router;
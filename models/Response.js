// models/Response.js
const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    publication: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Response', ResponseSchema);
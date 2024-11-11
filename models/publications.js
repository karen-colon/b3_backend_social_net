import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Define the Publication schema with enhanced validations and structure
const PublicationSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El ID del usuario es obligatorio"]
  },
  text: {
    type: String,
    required: [true, "El texto de la publicación es obligatorio"],
    trim: true,
    maxlength: [1000, "El texto de la publicación no puede superar los 1000 caracteres"]
  },
  file: {
    type: String,
    trim: true,
    match: [/^.*\.(jpg|jpeg|png|gif|mp4|mkv)$/, "Formato de archivo no válido"], // Supports images and video formats
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Add Mongoose pagination plugin for easy data handling
PublicationSchema.plugin(mongoosePaginate);

// Export the Publication model
export default model("Publication", PublicationSchema, "publications");

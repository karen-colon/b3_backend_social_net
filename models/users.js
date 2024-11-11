import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { followThisUser, followUserIds } from '../services/followServices.js';

// Define the user schema with enhanced validation, structure, and improved design
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true,
    maxlength: [50, "El nombre no puede superar los 50 caracteres"],
    match: [/^[a-zA-ZÀ-ÿ\s]+$/, "El nombre solo puede contener letras y espacios"]
  },
  last_name: {
    type: String,
    required: [true, "El apellido es obligatorio"],
    trim: true,
    maxlength: [50, "El apellido no puede superar los 50 caracteres"],
    match: [/^[a-zA-ZÀ-ÿ\s]+$/, "El apellido solo puede contener letras y espacios"]
  },
  nick: {
    type: String,
    required: [true, "El nombre de usuario es obligatorio"],
    unique: true,
    trim: true,
    minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
    maxlength: [30, "El nombre de usuario no puede superar los 30 caracteres"],
    match: [/^[\w.-]+$/, "El nombre de usuario solo puede contener letras, números, puntos y guiones"]
  },
  email: {
    type: String,
    required: [true, "El correo electrónico es obligatorio"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "El correo electrónico no es válido"]
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [300, "La biografía no puede superar los 300 caracteres"]
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [8, "La contraseña debe tener al menos 8 caracteres"]
  },
  role: {
    type: String,
    enum: ["role_user", "role_admin"],
    default: "role_user"
  },
  image: {
    type: String,
    default: "default_user.png",
    match: [/^.*\.(jpg|jpeg|png|gif)$/, "Formato de imagen no válido"]
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true // Automatically add createdAt and updatedAt fields
});

// Pagination plugin for easier user list management
UserSchema.plugin(mongoosePaginate);

// Export the User model
export default model("User", UserSchema, "users");

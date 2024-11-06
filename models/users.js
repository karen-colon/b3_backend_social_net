import { Schema, model } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

// Definir el esquema del usuario
const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    trim: true
  },
  last_name: {
    type: String,
    required: [true, "El apellido es obligatorio"],
    trim: true
  },
  nick: {
    type: String,
    required: [true, "El nombre de usuario es obligatorio"],
    unique: true,
    trim: true
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
    trim: true
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
    default: "default_user.png"
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

// Configurar el plugin de paginación de Mongoose
UserSchema.plugin(mongoosePaginate);

export default model("User", UserSchema, "users");

import User from '../models/users.js'; 
import Follow from '../models/follows.js';  
import Publication from '../models/publications.js';  
import bcrypt from 'bcrypt'; 
import { createToken } from '../services/jwt.js'; 
import { followThisUser, followUserIds } from '../services/followServices.js'; 

// Método de prueba del controlador user
export const testUser = (req, res) => {
  return res.status(200).send({ message: "Mensaje enviado desde el controlador de Usuarios" });
};

// Método Registro de Usuarios
export const registro = async (req, res) => {
  try {
    let params = req.body;

    // Validar los datos obtenidos
    if (!params.name || !params.last_name || !params.nick || !params.email || !params.password) {
      return res.status(400).json({ status: "error", mensaje: "Faltan datos por enviar" });
    }

    let user_to_save = new User(params);

    // Control de usuarios duplicados
    const existingUser = await User.findOne({ $or: [ { email: user_to_save.email.toLowerCase() }, { nick: user_to_save.nick.toLowerCase() } ] });
    if (existingUser) {
      return res.status(409).send({ status: "error", mensaje: "¡El usuario ya existe en la BD!" });
    }

    // Cifrar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user_to_save.password, salt);
    user_to_save.password = hashedPassword;

    // Guardar el usuario
    await user_to_save.save();

    return res.status(201).json({ status: "creado", mensaje: "Registro de usuario exitoso", user_to_save });

  } catch (error) {
    console.log("Error en el registro de usuario: ", error);
    return res.status(500).send({ status: "error", mensaje: "Error en el registro de usuario" });
  }
};

// Método de Login (usar JWT)
export const login = async (req, res) => {
  try {
    let params = req.body;
    if (!params.email || !params.password) {
      return res.status(400).send({ status: "error", message: "Faltan datos por enviar" });
    }

    const userBD = await User.findOne({ email: params.email.toLowerCase() });
    if (!userBD) {
      return res.status(404).send({ status: "error", message: "Usuario no encontrado" });
    }

    const validPassword = await bcrypt.compare(params.password, userBD.password);
    if (!validPassword) {
      return res.status(401).send({ status: "error", message: "Contraseña incorrecta" });
    }

    const token = createToken(userBD);
    return res.status(200).json({
      status: "success",
      message: "Autenticación exitosa",
      token,
      userBD: {
        id: userBD._id,
        name: userBD.name,
        last_name: userBD.last_name,
        email: userBD.email,
        nick: userBD.nick,
        image: userBD.image
      }
    });
  } catch (error) {
    console.log("Error en la autenticación del usuario: ", error);
    return res.status(500).send({ status: "error", message: "Error en la autenticación del usuario" });
  }
};

// Método para mostrar el perfil de un usuario
export const perfil = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.user || !req.user.userId) {
      return res.status(401).send({ status: "error", mensaje: "Usuario no autenticado" });
    }

    const userProfile = await User.findById(userId).select('-password -role -email -__v');
    if (!userProfile) {
      return res.status(404).send({ status: "error", mensaje: "Usuario no encontrado" });
    }

    const followInfo = await followThisUser(req.user.userId, userId);
    return res.status(200).json({ status: "success", user: userProfile, followInfo });

  } catch (error) {
    console.log("Error al obtener el perfil del usuario: ", error);
    return res.status(500).send({ status: "error", message: "Error al obtener el perfil del usuario" });
  }
};

// Método para listar usuarios
export const listUsers = async (req, res) => {
  try {
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 4;

    const options = { page: page, limit: itemsPerPage, select: '-password -email -role -__v' };
    const users = await User.paginate({}, options);
    if (!users || users.docs.length === 0) {
      return res.status(404).send({ status: "error", message: "No existen usuarios disponibles" });
    }

    let followUsers = await followUserIds(req);
    return res.status(200).json({
      status: "success",
      users: users.docs,
      totalDocs: users.totalDocs,
      totalPages: users.totalPages,
      currentPage: users.page,
      following_users: followUsers.following,
      followers: followUsers.followers
    });
  } catch (error) {
    console.log("Error al listar los usuarios: ", error);
    return res.status(500).send({ status: "error", message: "Error al listar los usuarios" });
  }
};

// Método para actualizar los datos del usuario
export const updateUser = async (req, res) => {
  try {
    let userIdentity = req.user;
    let userToUpdate = req.body;

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;

    const users = await User.find({ $or: [{ email: userToUpdate.email }, { nick: userToUpdate.nick }] }).exec();
    const isDuplicateUser = users.some(user => user && user._id.toString() !== userIdentity.userId);
    if (isDuplicateUser) {
      return res.status(400).send({ status: "error", message: "Error, solo se pueden actualizar los datos del usuario registrado" });
    }

    if (userToUpdate.password) {
      let pwd = await bcrypt.hash(userToUpdate.password, 10);
      userToUpdate.password = pwd;
    } else {
      delete userToUpdate.password;
    }

    let userUpdated = await User.findByIdAndUpdate(userIdentity.userId, userToUpdate, { new: true });
    if (!userUpdated) {
      return res.status(400).send({ status: "error", message: "Error al actualizar el usuario" });
    }

    return res.status(200).json({ status: "success", message: "Usuario actualizado correctamente", usuario: userUpdated });
  } catch (error) {
    console.log("Error al actualizar los datos del usuario: ", error);
    return res.status(500).send({ status: "error", message: "Error al actualizar los datos del usuario" });
  }
};

// Método para subir AVATAR (imagen de perfil)
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send({ status: "error", message: "Error la petición no incluye la imagen" });
    }

    const avatarUrl = req.file.path;
    const userUpdated = await User.findByIdAndUpdate(req.user.userId, { image: avatarUrl }, { new: true });
    if (!userUpdated) {
      return res.status(500).send({ status: "error", message: "Error al subir el archivo del avatar" });
    }

    return res.status(200).json({ status: "success", user: userUpdated, file: avatarUrl });
  } catch (error) {
    console.log("Error al subir el archivo del avatar", error);
    return res.status(500).send({ status: "error", message: "Error al subir el archivo del avatar" });
  }
};

// Método para mostrar el AVATAR (imagen de perfil)
export const avatar = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('image');
    if (!user || !user.image) {
      return res.status(404).send({ status: "error", message: "No existe usuario o imagen" });
    }

    return res.redirect(user.image);
  } catch (error) {
    console.log("Error al mostrar el archivo del avatar", error);
    return res.status(500).send({ status: "error", message: "Error al mostrar el archivo del avatar" });
  }
};


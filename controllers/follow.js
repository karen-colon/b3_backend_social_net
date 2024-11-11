import Follow from '../models/follows.js';
import User from '../models/users.js';
import { followUserIds } from "../services/followServices.js";

// Respuesta estándar para el manejo de errores
const handleError = (res, message, statusCode = 500) => {
  return res.status(statusCode).send({
    status: "error",
    message
  });
};

// Verificación si un usuario existe
const checkUserExists = async (userId) => {
  const user = await User.findById(userId);
  return user ? true : false;
};

// Método de prueba del controlador follow
export const testFollow = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador de Follow"
  });
};

// Método para guardar un follow (seguir a otro usuario)
export const saveFollow = async (req, res) => {
  try {
    const { followed_user } = req.body;
    const { userId } = req.user;

    // Verificación de usuario autenticado
    if (!userId) return handleError(res, "No se ha proporcionado el usuario para realizar el following", 400);

    // Verificar si el usuario está intentando seguirse a sí mismo
    if (userId === followed_user) return handleError(res, "No puedes seguirte a ti mismo", 400);

    // Verificar si el usuario seguido existe
    const followedUserExists = await checkUserExists(followed_user);
    if (!followedUserExists) return handleError(res, "El usuario que intentas seguir no existe", 404);

    // Verificar si ya existe un seguimiento
    const existingFollow = await Follow.findOne({ following_user: userId, followed_user });
    if (existingFollow) return handleError(res, "Ya estás siguiendo a este usuario", 400);

    // Crear un nuevo seguimiento
    const newFollow = new Follow({ following_user: userId, followed_user });
    const followStored = await newFollow.save();

    // Verificación de almacenamiento exitoso
    if (!followStored) return handleError(res, "No se ha podido seguir al usuario", 500);

    // Obtener detalles del usuario seguido
    const followedUserDetails = await User.findById(followed_user).select('name last_name');
    if (!followedUserDetails) return handleError(res, "Usuario no encontrado", 404);

    const combinedFollowData = {
      ...followStored.toObject(),
      followedUser: {
        name: followedUserDetails.name,
        last_name: followedUserDetails.last_name
      }
    };

    return res.status(200).json({
      status: "success",
      identity: req.user,
      follow: combinedFollowData
    });

  } catch (error) {
    if (error.code === 11000) {
      return handleError(res, "Ya estás siguiendo a este usuario", 400);
    }
    return handleError(res, "Error al seguir al usuario");
  }
};

// Método para eliminar un follow (dejar de seguir)
export const unfollow = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id: followedId } = req.params;

    const followDeleted = await Follow.findOneAndDelete({
      following_user: userId,
      followed_user: followedId
    });

    if (!followDeleted) return handleError(res, "No se encontró el seguimiento a eliminar.", 404);

    return res.status(200).send({
      status: "success",
      message: "Dejaste de seguir al usuario correctamente."
    });

  } catch (error) {
    return handleError(res, "Error al dejar de seguir al usuario.");
  }
};

// Método para listar usuarios que estoy siguiendo
export const following = async (req, res) => {
  try {
    let userId = req.user?.userId || req.params.id;
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    const options = {
      page,
      limit: itemsPerPage,
      populate: {
        path: 'followed_user',
        select: '-password -role -__v -email'
      },
      lean: true
    };

    const follows = await Follow.paginate({ following_user: userId }, options);
    const followUsers = await followUserIds(req);

    return res.status(200).send({
      status: "success",
      message: "Listado de usuarios que estoy siguiendo",
      follows: follows.docs,
      total: follows.totalDocs,
      pages: follows.totalPages,
      page: follows.page,
      limit: follows.limit,
      users_following: followUsers.following,
      user_follow_me: followUsers.followers
    });

  } catch (error) {
    return handleError(res, "Error al listar los usuarios que estás siguiendo.");
  }
};

// Método para listar los usuarios que me siguen
export const followers = async (req, res) => {
  try {
    let userId = req.user?.userId || req.params.id;
    let page = req.params.page ? parseInt(req.params.page, 10) : 1;
    let itemsPerPage = req.query.limit ? parseInt(req.query.limit, 10) : 5;

    const options = {
      page,
      limit: itemsPerPage,
      populate: {
        path: 'following_user',
        select: '-password -role -__v -email'
      },
      lean: true
    };

    const follows = await Follow.paginate({ followed_user: userId }, options);
    const followUsers = await followUserIds(req);

    return res.status(200).send({
      status: "success",
      message: "Listado de usuarios que me siguen",
      follows: follows.docs,
      total: follows.totalDocs,
      pages: follows.totalPages,
      page: follows.page,
      limit: follows.limit,
      users_following: followUsers.following,
      user_follow_me: followUsers.followers
    });

  } catch (error) {
    return handleError(res, "Error al listar los usuarios que me siguen.");
  }
};

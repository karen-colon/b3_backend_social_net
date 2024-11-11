// services/followServices.js

import Follow from "../models/follows.js";

// Definición de la función followUserIds
export const followUserIds = async (userId) => {
  
  return following.map(follow => follow.followed_user);
};



    // Recuperar los IDs de los usuarios que sigue el usuario autenticado
    const following = await Follow.find({ following_user: userId })
      .select({ followed_user: 1, _id: 0 })
      .exec();

    // Recuperar los IDs de los usuarios que siguen al usuario autenticado
    const followers = await Follow.find({ followed_user: userId })
      .select({ following_user: 1, _id: 0 })
      .exec();

    // Mapear los resultados a arrays de IDs
    const followingIds = following.map(follow => follow.followed_user);
    const followerIds = followers.map(follow => follow.following_user);

  // Esto es correcto
export const someFunction = async (req, res) => {
  try {
    // Lógica aquí
    return res.status(200).json({
      message: "Success"
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ message: "Error" });
  }
};

// Función para seguir a otro usuario
export const followThisUser = async (userId, targetUserId) => {
  try {
    // Comprobar si ya existe un registro de seguimiento
    const existingFollow = await Follow.findOne({ following_user: userId, followed_user: targetUserId });

    if (existingFollow) {
      throw new Error("Ya estás siguiendo a este usuario.");
    }

    // Crear un nuevo registro de seguimiento
    const newFollow = new Follow({
      following_user: userId,
      followed_user: targetUserId
    });

    // Guardar el seguimiento
    await newFollow.save();
    return { success: true, message: "Ahora estás siguiendo al usuario." };

  } catch (error) {
    console.error("Error al seguir al usuario:", error);
    return { success: false, message: error.message };
  }
};

// Función para obtener el estado de seguimiento entre dos usuarios
export const getFollowStatus = async (userId, profileUserId) => {
  try {
    // Validar que ambos IDs de usuario están proporcionados
    if (!userId || !profileUserId) {
      throw new Error("Los IDs de los usuarios son inválidos o están faltando");
    }

       return {
      following: isFollowing !== null,  // Si encuentra un registro, está siguiendo
      follower: isFollower !== null     // Si encuentra un registro, lo están siguiendo
    };

  } catch (error) {
    console.error("Error al recuperar el estado de seguimiento:", error);
    return {
      following: false,
      follower: false
    };
  }
};

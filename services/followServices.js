// services/followServices.js

import Follow from "../models/follows.js";

 // Asegúrate de que las funciones estén exportadas correctamente
export const followThisUser = (userId, targetUserId) => {
  // Implementación de la función
};

export const followUserIds = (userId) => {
  // Implementación de la función
};

  try {
    // Obtener el ID del usuario autenticado desde el middleware de autenticación
    const userId = req.user.userId;

    // Verificar si el ID del usuario está disponible
    if (!userId) {
      return res.status(400).json({
        status: "error",
        message: "No se ha recibido el ID del usuario"
      });
    }

    // Recuperar los IDs de los usuarios que sigue el usuario autenticado
    const following = await Follow.find({ following_user: userId })
      .select({ followed_user: 1, _id: 0 }) // Solo traer los IDs de los usuarios seguidos
      .exec();

    // Recuperar los IDs de los usuarios que siguen al usuario autenticado
    const followers = await Follow.find({ followed_user: userId })
      .select({ following_user: 1, _id: 0 }) // Solo traer los IDs de los seguidores
      .exec();

    // Mapear los resultados a arrays de IDs
    const followingIds = following.map(follow => follow.followed_user);
    const followerIds = followers.map(follow => follow.following_user);

    // Enviar respuesta con los arrays de IDs de los usuarios seguidos y seguidores
    return res.status(200).json({
      following: followingIds,
      followers: followerIds
    });

  } catch (error) {
    console.error("Error al recuperar los IDs de usuarios:", error);
    return res.status(500).json({
      following: [],
      followers: []
    });
    
  }

// Función para obtener el estado de seguimiento entre dos usuarios
export const getFollowStatus = async (userId, profileUserId) => {
  try {
    // Validar que ambos IDs de usuario están proporcionados
    if (!userId || !profileUserId) {
      throw new Error("Los IDs de los usuarios son inválidos o están faltando");
    }

    // Verificar si el usuario autenticado sigue al usuario del perfil
    const isFollowing = await Follow.findOne({ following_user: userId, followed_user: profileUserId });

    // Verificar si el usuario del perfil sigue al usuario autenticado
    const isFollower = await Follow.findOne({ following_user: profileUserId, followed_user: userId });

    // Retornar el estado de seguimiento
    return {
      following: isFollowing !== null,  // Si encuentra un registro, es que está siguiendo
      follower: isFollower !== null     // Si encuentra un registro, es que lo están siguiendo
    };

  } catch (error) {
    console.error("Error al recuperar el estado de seguimiento:", error);
    return {
      following: false,
      follower: false
    };
    
  }
};

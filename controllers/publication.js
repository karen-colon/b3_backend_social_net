import Publication from '../models/publications.js';
import { followUserIds } from '../services/followServices.js';

// Método de prueba del controlador publication
export const testPublication = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde el controlador de Publication"
  });
};

// Método para guardar una publicación
export const savePublication = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).send({
        status: "error",
        message: "Debes enviar el texto de la publicación"
      });
    }

    let newPublication = new Publication({
      text,
      user_id: req.user.userId
    });

    const publicationStored = await newPublication.save();

    if (!publicationStored) {
      return res.status(500).send({
        status: "error",
        message: "No se ha guardado la publicación"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "¡Publicación creada con éxito!",
      publication: publicationStored
    });

  } catch (error) {
    console.error(`Error al crear la publicación: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al crear la publicación"
    });
  }
};

// Método para mostrar una publicación
export const showPublication = async (req, res) => {
  try {
    const publicationId = req.params.id;

    const publicationStored = await Publication.findById(publicationId).populate('user_id', 'name last_name nick image');

    if (!publicationStored) {
      return res.status(404).send({
        status: "error",
        message: "No existe la publicación"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Publicación encontrada",
      publication: publicationStored
    });

  } catch (error) {
    console.error(`Error al mostrar la publicación: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar la publicación"
    });
  }
};

// Método para eliminar una publicación
export const deletePublication = async (req, res) => {
  try {
    const publicationId = req.params.id;

    const publicationDeleted = await Publication.findOneAndDelete({
      user_id: req.user.userId,
      _id: publicationId
    }).populate('user_id', 'name last_name');

    if (!publicationDeleted) {
      return res.status(404).send({
        status: "error",
        message: "No se ha encontrado o no tienes permiso para eliminar esta publicación"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Publicación eliminada con éxito",
      publication: publicationDeleted
    });

  } catch (error) {
    console.error(`Error al eliminar la publicación: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al eliminar la publicación"
    });
  }
};

// Método para listar publicaciones de un usuario
export const publicationsUser = async (req, res) => {
  try {
    const userId = req.params.id;
    let page = parseInt(req.params.page, 10) || 1;
    let itemsPerPage = parseInt(req.query.limit, 10) || 5;

    const options = {
      page,
      limit: itemsPerPage,
      sort: { created_at: -1 },
      populate: {
        path: 'user_id',
        select: '-password -role -__v -email'
      },
      lean: true
    };

    const publications = await Publication.paginate({ user_id: userId }, options);

    if (!publications.docs || publications.docs.length <= 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay publicaciones para mostrar"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Publicaciones del usuario:",
      publications: publications.docs,
      total: publications.totalDocs,
      pages: publications.totalPages,
      page: publications.page,
      limit: publications.limit
    });

  } catch (error) {
    console.error(`Error al mostrar las publicaciones: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar las publicaciones"
    });
  }
};

// Método para subir imágenes a las publicaciones
export const uploadMedia = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const publicationExists = await Publication.findById(publicationId);

    if (!publicationExists) {
      return res.status(404).send({
        status: "error",
        message: "No existe la publicación"
      });
    }

    if (!req.file) {
      return res.status(400).send({
        status: "error",
        message: "La petición no incluye la imagen"
      });
    }

    const mediaUrl = req.file.path;

    const publicationUpdated = await Publication.findByIdAndUpdate(
      publicationId,
      { file: mediaUrl },
      { new: true }
    );

    if (!publicationUpdated) {
      return res.status(500).send({
        status: "error",
        message: "Error en la subida de la imagen"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Archivo subido con éxito",
      publication: publicationUpdated,
      file: mediaUrl
    });

  } catch (error) {
    console.error(`Error al subir la imagen: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al subir la imagen"
    });
  }
};

// Método para mostrar el archivo subido a la publicación
export const showMedia = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const publication = await Publication.findById(publicationId).select('file');

    if (!publication || !publication.file) {
      return res.status(404).send({
        status: "error",
        message: "No existe el archivo para esta publicación"
      });
    }

    return res.redirect(publication.file);

  } catch (error) {
    console.error(`Error al mostrar el archivo de la publicación: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar archivo en la publicación"
    });
  }
};

// Método para listar todas las publicaciones de los usuarios que sigo
export const feed = async (req, res) => {
  try {
    let page = parseInt(req.params.page, 10) || 1;
    let itemsPerPage = parseInt(req.query.limit, 10) || 5;

    if (!req.user || !req.user.userId) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no autenticado"
      });
    }

    const myFollows = await followUserIds(req);

    if (!myFollows.following || myFollows.following.length === 0) {
      return res.status(404).send({
        status: "error",
        message: "No sigues a ningún usuario, no hay publicaciones que mostrar"
      });
    }

    const options = {
      page,
      limit: itemsPerPage,
      sort: { created_at: -1 },
      populate: {
        path: 'user_id',
        select: '-password -role -__v -email'
      },
      lean: true
    };

    const result = await Publication.paginate(
      { user_id: { $in: myFollows.following } },
      options
    );

    if (!result.docs || result.docs.length <= 0) {
      return res.status(404).send({
        status: "error",
        message: "No hay publicaciones para mostrar"
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Feed de Publicaciones",
      publications: result.docs,
      total: result.totalDocs,
      pages: result.totalPages,
      page: result.page,
      limit: result.limit
    });

  } catch (error) {
    console.error(`Error al mostrar las publicaciones en el feed: ${error}`);
    return res.status(500).send({
      status: "error",
      message: "Error al mostrar las publicaciones en el feed"
    });
  }
};

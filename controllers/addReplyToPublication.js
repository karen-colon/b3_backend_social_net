export const addReplyToPublication = async(req, res) => {
    try {
        const { publicationId, replyText } = req.body;
        const userId = req.user._id; // El ID del usuario autenticado

        // Validar que la publicación existe
        const publication = await Publication.findById(publicationId);
        if (!publication) {
            return res.status(404).json({ status: "error", message: "Publicación no encontrada" });
        }

        // Crear la nueva respuesta
        const newReply = new Reply({
            publication: publicationId,
            user: userId,
            text: replyText,
            createdAt: Date.now(),
        });

        // Guardar la respuesta
        await newReply.save();

        // Opcional: Agregar la respuesta al array de respuestas de la publicación
        publication.replies.push(newReply._id);
        await publication.save();

        // Responder con éxito
        res.status(200).json({ status: "success", message: "Respuesta agregada con éxito", reply: newReply });

    } catch (error) {
        console.error(error);
        res.status(500).json({ status: "error", message: "Error al agregar la respuesta" });
    }
};
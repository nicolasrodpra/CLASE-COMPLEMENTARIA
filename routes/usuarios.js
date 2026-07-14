const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb'); 

// GET - Consultar catálogo completo de usuarios
router.get('/usuarios', async (req, res) => {
    try {
        const usuarios = await mongoose.connection.db.collection('usuarios').find({}).toArray();
        res.json(usuarios);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al consultar los usuarios" });
    }
});

// POST - Crear un nuevo usuario (y su mascota inicial)
router.post('/usuarios', async (req, res) => {
    try {
        const nuevoUsuario = req.body;

        // Validación básica: Exigimos nombre y email
        if (!nuevoUsuario.nombre || !nuevoUsuario.email) {
            return res.status(400).json({
                error: "Formato invalido, el nombre y el email son obligatorios"
            });
        }

        const resultado = await mongoose.connection.db.collection('usuarios').insertOne(nuevoUsuario);

        res.status(201).json({
            mensaje: "Usuario registrado exitosamente",
            id_generado: resultado.insertedId,
            datosGuardados: nuevoUsuario
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error critico al guardar el usuario" });
    }
});

// PUT - Actualizar un usuario por ID usando $set (ej. para actualizar la energía de la mascota)
router.put('/usuarios/:id', async (req, res) => {
    try {
        const idUsuario = req.params.id;
        const datosNuevos = req.body;

        const resultado = await mongoose.connection.db.collection('usuarios').updateOne(
            { _id: new ObjectId(idUsuario) }, 
            { $set: datosNuevos } 
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado en la BD" });
        }

        res.json({
            mensaje: "Perfil de usuario actualizado correctamente", 
            modificaciones: resultado.modifiedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo actualizar el usuario" });
    }
});

// DELETE - Eliminar físicamente un usuario por ID
router.delete('/usuarios/:id', async (req, res) => {
    try {
        const idUsuario = req.params.id;
        const resultado = await mongoose.connection.db.collection('usuarios').deleteOne({
            _id: new ObjectId(idUsuario)
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: "Usuario no encontrado en la BD o ya fue eliminado." });
        }

        res.json({ mensaje: "Usuario eliminado correctamente del sistema" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo eliminar el usuario" });
    }
});

module.exports = router;
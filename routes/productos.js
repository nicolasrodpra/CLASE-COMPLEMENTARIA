const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb'); 


router.get('/health', (req, res) => {
    res.status(200).json({
        estado: "Servidor funcionando", 
        Timestamp: new Date().toISOString()
    });
});


router.get('/productos', async (req, res) => {
    try {
        const productos = await mongoose.connection.db.collection('productos').find({}).toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar los productos" });
    }
});


router.post('/productos', async (req, res) => {
    try {
        const nuevoProducto = req.body;

        if (!nuevoProducto.nombre || !nuevoProducto.precio) {
            return res.status(400).json({
                error: "Formato invalido, el precio y el nombre son obligatorios"
            });
        }

        const resultado = await mongoose.connection.db.collection('productos').insertOne(nuevoProducto);

        res.status(201).json({
            mensaje: "Producto creado",
            id_generado: resultado.insertedId,
            datosGuardados: nuevoProducto
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error critico al guardar el producto" });
    }
});


router.put('/productos/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;
        const datosNuevos = req.body;

        const resultado = await mongoose.connection.db.collection('productos').updateOne(
            { _id: new ObjectId(idProducto) }, 
            { $set: datosNuevos } 
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la BD" });
        }

        res.json({
            mensaje: "Producto actualizado correctamente", 
            modificaciones: resultado.modifiedCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo actualizar el producto" });
    }
});


router.delete('/productos/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;
        const resultado = await mongoose.connection.db.collection('productos').deleteOne({
            _id: new ObjectId(idProducto)
        });

        if (resultado.deletedCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la BD o ya fue eliminado." });
        }

        res.json({ mensaje: "Producto eliminado correctamente" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "No se pudo eliminar el producto" });
    }
});
// PATCH - Reto Adicional: Actualizar solo el estado del producto
router.patch('/actualizar-estado/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;
        const { estado_nuevo } = req.body; // El nuevo estado que vas a enviar desde Insomnia

        // 1. Consultar si el recurso existe
        const producto = await mongoose.connection.db.collection('productos').findOne({
            _id: new ObjectId(idProducto)
        });

        if (!producto) {
            return res.status(404).json({ error: "El producto no existe en la base de datos." });
        }

        // 2. Condición de negocio estricta
        if (producto.estado === 'finalizado') {
            return res.status(403).json({ 
                error: "Prohibido: El producto ya se encuentra 'finalizado' y su estado es inmodificable." 
            });
        }

        // 3. Actualizar solo el campo de estado si pasa la validación
        await mongoose.connection.db.collection('productos').updateOne(
            { _id: new ObjectId(idProducto) },
            { $set: { estado: estado_nuevo } }
        );

        res.json({ 
            mensaje: "Estado actualizado exitosamente",
            estado_anterior: producto.estado || "sin estado",
            estado_actual: estado_nuevo
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error interno al intentar actualizar el estado" });
    }
});
module.exports = router;
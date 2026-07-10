const express = require('express');
const mongoose = require('mongoose');
const { objectId, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Conexion exitosa"))
    .catch(err => console.error("No se pudo conectar", err));

app.get('/api/productos', async (req, res) => {
    try {
        const productos = await mongoose.connection.db.collection('productos').find({}).toArray();
        res.json(productos);
    } catch (error) {
        res.status(500).json({ error: "Error al consultar los productos" });
    }
});

app.post('/api/productos', async (req, res) => {
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

app.put('/api/productos/:id', async (req, res) => {
    try {
        const idProducto = req.params.id;
        const datosNuevos = req.body;

        const resultado = await mongoose.connection.db.collection('productos').updateOne(
            { _id: new ObjectId(idProducto) }, // Condición
            { $set: datosNuevos } // Acción
        );

        if (resultado.matchedCount === 0) {
            return res.status(404).json({ error: "Producto no encontrado en la BD" });
        }

        res.json({
            mensaje: "Producto actualizado correctamente", modificaciones: resultado.modifiedCount
        }
        );
    } catch (error) {
        console.error(error);
        resultado.status(500).json({error: "No se pudo actualizar el producto"});
    }
})

app.delete('/api/productos/:id', async (req, res)=>{
    try{
        const idProducto = req.params.id;
        const resultado = await mongoose.connection.db.collection('productos').deleteOne({
            _id: new ObjectId(idProducto)
        });

        if(resultado.deletedCount === 0){
            return res.status(404).json({ error: "Producto no encontrado en la BD o ya fue eliminado." });
        }

        res.json({mensaje: "Producto eliminado correctamente"});
    } catch (error){
        resultado.status(500).json({error: "No se pudo eliminar el producto"});
    }
})

app.listen(PORT, () => {
    console.log(`El backend está escuchando en localhost:${PORT}`);
});
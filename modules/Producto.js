const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: [true, "El nombre del producto es obligatorio"],
        trim: true
    },
    precio: {
        type: Number,
        required: [true, "El precio es obligatorio"],
        min: [0, "El precio no puede ser un número negativo"]
    },
    stock: {
        type: Number,
        default: 0
    },
    categoria: {
        type: String,
        default: "General"
    },
    // 🔥 CAMPO NUEVO: Vital para el Reto Adicional
    estado: {
        type: String,
        // enum: Obliga a que solo se puedan guardar estas tres palabras exactas
        enum: ['pendiente', 'procesado', 'finalizado'], 
        default: 'pendiente' // Por defecto, todo producto nuevo nace "pendiente"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Producto', productoSchema);
import mongoose from 'mongoose';

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  precio: { type: Number, required: true, min: 0 },
  stock:  { type: Number, required: true, min: 0 }
}, { timestamps: true });

export const Producto = mongoose.model('Producto', productoSchema);

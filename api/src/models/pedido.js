import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  productoId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  nombre:        { type: String, required: true },
  cantidad:      { type: Number, required: true, min: 1 },
  precioUnitario:{ type: Number, required: true, min: 0 },
  subtotal:      { type: Number, required: true, min: 0 }
}, { _id: false });

const pedidoSchema = new mongoose.Schema({
  estado: { type: String, enum: ['pendiente', 'preparando', 'listo'], required: true },
  total:  { type: Number, required: true, min: 0 },
  items:  { type: [itemSchema], validate: v => v.length > 0 }
}, { timestamps: true });

export const Pedido = mongoose.model('Pedido', pedidoSchema);

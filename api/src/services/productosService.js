import { Producto } from "../models/producto.js";

export async function crearProducto(data) {
  const producto = new Producto(data);
  return await producto.save();
}

export async function obtenerProductos() {
  return await Producto.find();
}

export async function obtenerProductoPorId(id) {
  return await Producto.findById(id);
}

export async function actualizarProducto(id, data) {
  return await Producto.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

export async function eliminarProducto(id) {
  return await Producto.findByIdAndDelete(id);
}

import { Pedido } from '../models/pedido.js';
import { Producto } from '../models/producto.js';
import { publishPedidoConfirmado } from './eventosService.js';

export async function confirmarPedido(pedidoId) {
  // Obtener pedido sin sesiones
  const pedido = await Pedido.findById(pedidoId);
  if (!pedido) throw new Error("NOT_FOUND");

  if (pedido.estado !== "pendiente") {
    throw new Error("INVALID_STATE");
  }

  let total = 0;

  // Verificar stock y calcular totales
  for (const item of pedido.items) {
    const prod = await Producto.findById(item.productoId);

    if (!prod) throw new Error("PRODUCT_NOT_FOUND");
    if (prod.stock < item.cantidad) throw new Error("NO_STOCK");

    // actualizar subtotal
    item.precioUnitario = prod.precio;
    item.subtotal = prod.precio * item.cantidad;

    total += item.subtotal;
  }

  // Descontar stock de cada producto
  for (const item of pedido.items) {
    await Producto.findByIdAndUpdate(
      item.productoId,
      { $inc: { stock: -item.cantidad } }
    );
  }

  pedido.total = total;
  pedido.estado = "preparando";

  await pedido.save();

  // emitir evento
  publishPedidoConfirmado(pedido);

  return pedido;
}

import mongoose from 'mongoose';
import { Pedido } from '../models/pedido.js';
import { Producto } from '../models/producto.js';
import { publishPedidoConfirmado } from './eventosService.js';

export async function confirmarPedido(pedidoId) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const pedido = await Pedido.findById(pedidoId).session(session);

    if (!pedido) {
      throw new Error('NOT_FOUND');
    }
    if (pedido.estado !== 'pendiente') {
      throw new Error('INVALID_STATE');
    }

    let total = 0;

    // Verificar stock y calcular totales
    for (const item of pedido.items) {
      const prod = await Producto.findById(item.productoId).session(session);
      if (!prod) throw new Error('PRODUCT_NOT_FOUND');
      if (prod.stock < item.cantidad) throw new Error('NO_STOCK');

      prod.stock -= item.cantidad;
      await prod.save({ session });

      item.precioUnitario = prod.precio;
      item.subtotal = prod.precio * item.cantidad;
      total += item.subtotal;
    }

    pedido.total = total;
    pedido.estado = 'preparando';
    await pedido.save({ session });

    await session.commitTransaction();
    session.endSession();

    // publicar evento
    publishPedidoConfirmado(pedido);

    return pedido;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

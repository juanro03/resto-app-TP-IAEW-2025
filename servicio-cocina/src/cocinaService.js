import { Pedido } from "./models/pedido.js";
import amqp from "amqplib";

let channel;

export async function initRabbitPublisher(conn) {
  channel = await conn.createChannel();
  await channel.assertExchange('pedidos', 'topic', { durable: true });
}

export async function procesarPedidoConfirmado(evento) {
  const pedido = await Pedido.findById(evento.id);
  if (!pedido) return;

  pedido.estado = "listo";
  await pedido.save();

  if (channel) {
    const payload = Buffer.from(JSON.stringify({
      id: pedido._id,
      estado: pedido.estado
    }));
    channel.publish("pedidos", "pedido.actualizado", payload, { persistent: true });
  }
}

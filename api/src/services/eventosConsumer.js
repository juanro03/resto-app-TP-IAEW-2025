// api/src/services/eventosConsumer.js
import amqp from "amqplib";
import { config } from "../config.js";
import { logger } from "../logger.js";
import { Pedido } from "../models/pedido.js";
import { broadcastPedidoActualizado } from "../ws/notifier.js";

export async function initPedidoActualizadoConsumer() {
  try {
    const conn = await amqp.connect(config.rabbitUrl);
    const channel = await conn.createChannel();

    await channel.assertExchange("pedidos", "topic", { durable: true });

    const { queue } = await channel.assertQueue("api_pedido_actualizado", {
      durable: true,
    });

    await channel.bindQueue(queue, "pedidos", "pedido.actualizado");

    logger.info({ msg: "API suscripta a pedido.actualizado" });

    channel.consume(queue, async (message) => {
      if (!message) return;

      try {
        const data = JSON.parse(message.content.toString());

        // Buscar el pedido en DB y actualizar estado
        const pedido = await Pedido.findById(data.id);
        if (!pedido) {
          logger.warn({ msg: "Pedido no encontrado al actualizar", id: data.id });
          channel.ack(message);
          return;
        }

        pedido.estado = data.estado;
        await pedido.save();

        // Emitir por WebSocket
        broadcastPedidoActualizado(pedido);

        logger.info({
          msg: "Pedido actualizado desde RabbitMQ",
          id: pedido._id,
          estado: pedido.estado,
        });

        channel.ack(message);
      } catch (err) {
        logger.error({ msg: "Error procesando pedido.actualizado", err });
        channel.nack(message, false, false); // descarta el mensaje
      }
    });
  } catch (err) {
    logger.error({ msg: "Error iniciando consumer pedido.actualizado", err });
  }
}

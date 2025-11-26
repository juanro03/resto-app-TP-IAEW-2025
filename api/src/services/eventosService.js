import amqp from 'amqplib';
import { config } from '../config.js';
import { logger } from '../logger.js';

let channel;

export async function initRabbit() {
  const conn = await amqp.connect(config.rabbitUrl);
  channel = await conn.createChannel();

  await channel.assertExchange('pedidos', 'topic', { durable: true });

  logger.info({ msg: 'RabbitMQ conectado', url: config.rabbitUrl });
}

export function publishPedidoConfirmado(pedido) {
  if (!channel) throw new Error('Canal RabbitMQ no inicializado');

  const routingKey = 'pedido.confirmado';
  const payload = Buffer.from(JSON.stringify({
    id: pedido._id,
    estado: pedido.estado,
    items: pedido.items,
    total: pedido.total
  }));

  channel.publish('pedidos', routingKey, payload, { persistent: true });
  logger.info({ msg: 'Evento PedidoConfirmado publicado', pedidoId: pedido._id });
}

import "dotenv/config";
import amqp from "amqplib";
import { connectDb } from "./db.js";
import { logger } from "./logger.js";
import { procesarPedidoConfirmado, initRabbitPublisher } from "./cocinaService.js";

const RABBIT_URL = process.env.RABBIT_URL || "amqp://broker";

async function connectRabbitWithRetry(url, retries = 10, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      logger.info({ msg: `Intentando conectar a RabbitMQ (${i}/${retries})` });
      return await amqp.connect(url);
    } catch (err) {
      logger.warn({ msg: `RabbitMQ no disponible (intento ${i}), reintentando...` });
      if (i === retries) throw err;
      await new Promise(res => setTimeout(res, delay));
    }
  }
}

async function bootstrap() {
  await connectDb();

  const conn = await connectRabbitWithRetry(RABBIT_URL);

  const channel = await conn.createChannel();
  await channel.assertExchange("pedidos", "topic", { durable: true });

  const { queue } = await channel.assertQueue("cocina_pedido_confirmado", {
    durable: true
  });
  await channel.bindQueue(queue, "pedidos", "pedido.confirmado");

  await initRabbitPublisher(conn);

  logger.info({ msg: "Servicio de cocina suscripto a PedidoConfirmado" });

  channel.consume(queue, async msg => {
    if (!msg) return;
    try {
      const data = JSON.parse(msg.content.toString());
      await procesarPedidoConfirmado(data);
      channel.ack(msg);
    } catch (err) {
      logger.error({ msg: "Error procesando PedidoConfirmado", err });
      channel.nack(msg, false, false);
    }
  });
}

bootstrap().catch(err => {
  logger.error({ msg: "Fallo al iniciar servicio de cocina", err });
  process.exit(1);
});

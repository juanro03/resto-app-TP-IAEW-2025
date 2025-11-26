import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config.js';
import { connectDb } from './db.js';
import { initRabbit } from './services/eventosService.js';
import { initWs } from './ws/notifier.js';
import pedidosRouter from './routes/pedidos.js';
import { logger } from './logger.js';
import { initPedidoActualizadoConsumer } from "./services/eventosConsumer.js";


async function bootstrap() {
  await connectDb();
  await initRabbit();
  await initPedidoActualizadoConsumer();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/pedidos', pedidosRouter);
  // TODO: rutas de productos, etc.

  app.use((err, req, res, next) => {
    logger.error({ msg: 'Unhandled error', err });
    res.status(500).json({ error: 'Internal Server Error' });
  });

  const server = http.createServer(app);
  initWs(server);

  server.listen(config.port, () => {
    logger.info({ msg: 'API escuchando', port: config.port });
  });
}

bootstrap().catch((e) => {
  logger.error({ msg: 'Fallo al iniciar API', err: e });
  process.exit(1);
});

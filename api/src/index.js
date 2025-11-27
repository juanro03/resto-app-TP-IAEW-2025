import express from "express";
import http from "http";
import cors from "cors";
import { config } from "./config.js";
import { connectDb } from "./db.js";
import { initRabbit } from "./services/eventosService.js";
import { initWs } from "./ws/notifier.js";
import pedidosRouter from "./routes/pedidos.js";
import productosRouter from "./routes/productos.js";
import { logger } from "./logger.js";
import { initPedidoActualizadoConsumer } from "./services/eventosConsumer.js";
import { randomUUID } from "crypto";

async function bootstrap() {
  await connectDb();
  await initRabbit();
  await initPedidoActualizadoConsumer();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;

      logger.info({
        msg: "request_completed",
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,  
        duration_ms: duration
      });
    });

    next();
  });

  app.use("/pedidos", pedidosRouter);
  app.use("/productos", productosRouter);

  const server = http.createServer(app);
  initWs(server);

  server.listen(config.port, () => {
    logger.info({ msg: "API escuchando", port: config.port });
  });
}

bootstrap().catch(err => {
  logger.error({ msg: "Fallo al iniciar API", err });
  process.exit(1);
});

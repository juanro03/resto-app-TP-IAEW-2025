console.log(">>> DB.JS CARGADO");

import mongoose from 'mongoose';
import { config } from './config.js';
import { logger } from './logger.js';

export async function connectDb() {
  mongoose.set("strictQuery", true);

  // 🔥 DESACTIVA TRANSACCIONES IMPLÍCITAS
  mongoose.set("bufferCommands", false);
  mongoose.set("autoCreate", true);
  mongoose.set("autoIndex", true);

  await mongoose.connect(config.mongoUrl, {
    retryWrites: false,  // 👈 NECESARIO
    w: "majority",
    maxPoolSize: 10
  });

  logger.info({ msg: 'MongoDB conectado', url: config.mongoUrl });
}

console.log(">>> DB.JS CARGADO");

import mongoose from "mongoose";
import { logger } from "./logger.js";

export async function connectDb() {
  try {
    mongoose.set("strictQuery", true);

    // 🔥 DESACTIVA TRANSACCIONES IMPLÍCITAS
    mongoose.set("bufferCommands", false);
    mongoose.set("autoCreate", true);
    mongoose.set("autoIndex", true);

    await mongoose.connect(process.env.MONGO_URL, {
      retryWrites: false,  // 👈 NECESARIO PARA MONGO NO-REPLICASET
      w: "majority",
      maxPoolSize: 10
    });

    logger.info({ msg: "MongoDB conectado (servicio-cocina)" });

  } catch (err) {
    logger.error({ msg: "Error conectando a MongoDB en servicio-cocina", err });
    process.exit(1);
  }
}

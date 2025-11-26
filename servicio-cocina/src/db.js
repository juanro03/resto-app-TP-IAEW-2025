import mongoose from "mongoose";
import { logger } from "./logger.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://mongo:27017/resto?replicaSet=rs0";

export async function connectDb() {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(MONGO_URL);
    logger.info({ msg: "MongoDB conectado (servicio-cocina)" });
  } catch (err) {
    logger.error({ msg: "Error conectando a MongoDB en servicio-cocina", err });
    process.exit(1);
  }
}

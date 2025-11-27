console.log(">>> PRODUCTOS ROUTER CARGADO");

import { Router } from "express";
import {
  crearProducto,
  obtenerProductos,
  obtenerProductoPorId,
  actualizarProducto,
  eliminarProducto
} from "../services/productosService.js";

const router = Router();

// Crear producto
router.post("/", async (req, res) => {
  try {
    const nuevo = await crearProducto(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar productos
router.get("/", async (req, res) => {
  const productos = await obtenerProductos();
  res.json(productos);
});

// Obtener uno
router.get("/:id", async (req, res) => {
  const prod = await obtenerProductoPorId(req.params.id);
  if (!prod) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(prod);
});

// Actualizar
router.put("/:id", async (req, res) => {
  try {
    const prod = await actualizarProducto(req.params.id, req.body);
    if (!prod) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(prod);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar
router.delete("/:id", async (req, res) => {
  const prod = await eliminarProducto(req.params.id);
  if (!prod) return res.status(404).json({ error: "Producto no encontrado" });
  res.json({ msg: "Producto eliminado" });
});

export default router;

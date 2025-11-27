import { Router } from 'express';
import { Pedido } from '../models/pedido.js';
import { confirmarPedido } from '../services/pedidosService.js';
import { auth } from '../middlewares/auth.js';

const router = Router();

// listar pedidos (solo mozo)
router.get('/', auth('ROLE_MOZO'), async (req, res, next) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (e) { next(e); }
});

// crear pedido (solo mozo)
router.post('/', auth('ROLE_MOZO'), async (req, res, next) => {
  try {
    const { items } = req.body;
    const pedido = await Pedido.create({
      estado: 'pendiente',
      total: 0,
      items
    });
    res.status(201).json(pedido);
  } catch (e) { next(e); }
});

// confirmar pedido (solo mozo)
router.post('/:id/confirmar', auth('ROLE_MOZO'), async (req, res, next) => {
  try {
    const pedido = await confirmarPedido(req.params.id);
    res.json(pedido);
  } catch (e) {
    if (e.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    if (e.message === 'INVALID_STATE') {
      return res.status(409).json({ error: 'Sólo se puede confirmar pedidos pendientes' });
    }
    if (e.message === 'NO_STOCK') {
      return res.status(409).json({ error: 'Sin stock suficiente' });
    }
    next(e);
  }
});

export default router;

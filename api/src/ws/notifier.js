import { WebSocketServer } from 'ws';
import { logger } from '../logger.js';

let wss;

export function initWs(server) {
  wss = new WebSocketServer({ server });
  wss.on('connection', (socket) => {
    logger.info({ msg: 'Cliente WS conectado' });
    socket.on('close', () => logger.info({ msg: 'Cliente WS desconectado' }));
  });
}

export function broadcastPedidoActualizado(pedido) {
  if (!wss) return;
  const msg = JSON.stringify({ type: 'pedido_actualizado', payload: pedido });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(msg);
    }
  });
}

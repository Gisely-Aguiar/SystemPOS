// websocket.js
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });
export const connections = new Map();

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const transactionId = url.searchParams.get('transactionId');
  
  console.log('🔗 Nova conexão WebSocket para transaction:', transactionId);
  
  if (transactionId) {
    connections.set(transactionId, ws);
  }

  ws.on('close', () => {
    if (transactionId) {
      connections.delete(transactionId);
    }
    console.log('🔌 Conexão WebSocket fechada para:', transactionId);
  });

  ws.on('error', (error) => {
    console.error('❌ Erro WebSocket:', error);
  });
});

console.log('🚀 WebSocket server running on port 8080');
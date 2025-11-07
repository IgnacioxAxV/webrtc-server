require('dotenv').config();

const WebSocket = require('ws');
const { createHttpServer } = require('./httpServer');
const { setupSignaling } = require('./signaling');

// Environment variables
const PORT = process.env.PORT || 8000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 1. Crear el servidor WebSocket
const wss = new WebSocket.Server({ noServer: true });

// 2. Crear el servidor HTTP
const server = createHttpServer(wss);

// Endpoint base (útil para probar si el server responde)
server.on('request', (req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(' WebRTC Signaling Server is running');
  }
});

// 3. Manejar upgrade correctamente (sin escribir headers manuales)
server.on('upgrade', (request, socket, head) => {
  // Opcional: podés filtrar solo un path concreto (más ordenado)
  if (request.url === '/ws' || request.url === '/') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

// 4. Configurar señalización
setupSignaling(wss);

// 5. Iniciar servidor
server.listen(PORT, () => {
  console.log(`Environment: ${NODE_ENV}`);
  console.log(`Server running on port ${PORT}`);
});

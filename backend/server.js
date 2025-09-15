const express = require('express');
const { createServer } = require('http');
const { WebSocketServer } = require('ws');
const OrderBook = require('./orderbook');

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: '/orderbook' });

const orderBook = new OrderBook();

// เริ่มต้น OrderBook
orderBook.initialize().catch(console.error);

// เริ่มต้น heartbeat
orderBook.startHeartbeat();

// WebSocket connection handler
wss.on('connection', (ws) => {
  console.log('Frontend client connected');
  orderBook.addClient(ws);
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🪙 Binance BTCUSDT Order Book API',
    status: 'Running',
    endpoints: {
      health: '/health',
      websocket: '/orderbook'
    },
    timestamp: new Date().toISOString()
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = 3001;

server.listen(PORT, () => {
  console.log(`🚀 Binance OrderBook Backend running on port ${PORT}`);
  console.log(`📊 WebSocket: ws://localhost:${PORT}/orderbook`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});
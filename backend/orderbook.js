const axios = require('axios');
const WebSocket = require('ws');

class OrderBook {
  constructor() {
    this.bids = new Map();
    this.asks = new Map();
    this.lastUpdateId = 0;
    this.clients = new Set();
    this.binanceWs = null;
  }

  async initialize() {
    console.log('กำลังเชื่อมต่อ Binance WebSocket...');
    this.connectBinanceWebSocket();
    // รอให้ WebSocket เชื่อมต่อแล้วค่อยดึง snapshot
    await new Promise(resolve => {
      this.binanceWs.on('open', resolve);
    });
    console.log('กำลังดึงข้อมูล snapshot จาก Binance...');
    await this.fetchSnapshot();
  }

  async fetchSnapshot() {
    try {
      const response = await axios.get('https://api.binance.us/api/v3/depth?symbol=BTCUSDT&limit=1000');
      const { lastUpdateId, bids, asks } = response.data;

      this.lastUpdateId = lastUpdateId;
      this.bids.clear();
      this.asks.clear();

      bids.forEach(([price, qty]) => {
        this.bids.set(price, qty);
      });

      asks.forEach(([price, qty]) => {
        this.asks.set(price, qty);
      });

      console.log(`Snapshot loaded: ${bids.length} bids, ${asks.length} asks, lastUpdateId: ${this.lastUpdateId}`);

      // ตอนนี้ process buffered events
      console.log('🔄 Processing', this.eventBuffer.length, 'buffered events');
      this.eventBuffer.forEach(event => {
        this.processDepthUpdate(event);
      });
      this.eventBuffer = [];
    } catch (error) {
      console.error('Error fetching snapshot:', error);
      throw error;
    }
  }

  connectBinanceWebSocket() {
    this.eventBuffer = [];
    this.binanceWs = new WebSocket('wss://stream.binance.us:9443/ws/btcusdt@depth@100ms');

    this.binanceWs.on('open', () => {
      console.log('✅ เชื่อมต่อ Binance WebSocket สำเร็จ');
    });

    this.binanceWs.on('message', (data) => {
      try {
        const event = JSON.parse(data);
        console.log('📥 ได้รับข้อมูลจาก Binance:', event.E || 'unknown');

        if (this.lastUpdateId === 0) {
          // ยังไม่ได้ snapshot ให้ buffer events ไว้ก่อน
          this.eventBuffer.push(event);
          console.log('📦 Buffer event:', event.u, 'Total buffered:', this.eventBuffer.length);
        } else {
          this.processDepthUpdate(event);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });

    this.binanceWs.on('close', () => {
      console.log('Binance WebSocket ปิด กำลัง reconnect...');
      setTimeout(() => this.connectBinanceWebSocket(), 2000);
    });

    this.binanceWs.on('error', (error) => {
      console.error('Binance WebSocket error:', error.message);
    });
  }

  processDepthUpdate(event) {
    const { u: updateId, U: firstUpdateId, b: bids, a: asks } = event;

    if (updateId <= this.lastUpdateId) {
      console.log('⏭️ ข้าม update เก่า:', updateId, '<=', this.lastUpdateId);
      return;
    }

    if (firstUpdateId <= this.lastUpdateId + 1 && updateId >= this.lastUpdateId + 1) {
      console.log('🔄 กำลังอัพเดท orderbook:', { firstUpdateId, updateId, bidsCount: bids.length, asksCount: asks.length });

      bids.forEach(([price, qty]) => {
        if (qty === '0.00000000') {
          this.bids.delete(price);
        } else {
          this.bids.set(price, qty);
        }
      });

      asks.forEach(([price, qty]) => {
        if (qty === '0.00000000') {
          this.asks.delete(price);
        } else {
          this.asks.set(price, qty);
        }
      });

      this.lastUpdateId = updateId;
      console.log('📤 ส่งข้อมูลไปยัง', this.clients.size, 'clients');
      this.broadcastOrderBook();
    } else {
      console.log('❌ Update sequence ไม่ต่อเนื่อง:', { firstUpdateId, lastUpdateId: this.lastUpdateId, updateId });
    }
  }

  getTop5OrderBook() {
    const sortedBids = Array.from(this.bids.entries())
      .sort((a, b) => parseFloat(b[0]) - parseFloat(a[0]))
      .slice(0, 5);

    const sortedAsks = Array.from(this.asks.entries())
      .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
      .slice(0, 5);

    return {
      type: 'orderbook',
      symbol: 'BTCUSDT',
      ts: Date.now(),
      bids: sortedBids,
      asks: sortedAsks
    };
  }

  broadcastOrderBook() {
    const data = this.getTop5OrderBook();
    const message = JSON.stringify(data);

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  addClient(ws) {
    this.clients.add(ws);
    ws.send(JSON.stringify(this.getTop5OrderBook()));

    ws.on('close', () => {
      this.clients.delete(ws);
    });

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        if (message.type === 'pong') {
          console.log('Received pong from client');
        }
      } catch (error) {
        console.error('Error parsing client message:', error);
      }
    });
  }

  startHeartbeat() {
    setInterval(() => {
      const pingMessage = JSON.stringify({ type: 'ping' });
      this.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(pingMessage);
        }
      });
    }, 5000);
  }
}

module.exports = OrderBook;
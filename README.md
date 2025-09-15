# 🪙 Simple Binance Order Book

โปรเจค Simple Binance Order Book สำหรับ Kapara Technical Assignment

## 📋 คำอธิบาย

แอปพลิเคชันแสดง Order Book ของ BTCUSDT จาก Binance แบบ real-time ประกอบด้วย:

- **Backend**: Node.js + Express + JavaScript + WebSocket
- **Frontend**: Next.js 15 + React 19 + TypeScript + Tailwind CSS

## 🏗️ โครงสร้างโปรเจค

```
binance-orderbook/
├── backend/              # Backend Server (Port 3001)
│   ├── package.json
│   ├── server.js         # Main server file
│   └── orderbook.js      # Order book logic
├── frontend/             # Frontend App (Port 3000)
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── app/
│   │   ├── layout.tsx    # App layout
│   │   ├── page.tsx      # Main page
│   │   └── globals.css   # Global styles
├── README.md
└── PLAN.md
```

## 🚀 วิธีการรัน

### 1. เริ่มต้น Backend

```bash
cd backend
npm install
npm start
```

Backend จะรันที่ `http://localhost:3001`

### 2. เริ่มต้น Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend จะรันที่ `http://localhost:3000`

### 3. เปิดเว็บไซต์

เปิด [http://localhost:3000](http://localhost:3000) เพื่อดู Order Book

## ✨ Features

### Backend
- ✅ เชื่อมต่อ Binance REST API เพื่อดึง snapshot
- ✅ เชื่อมต่อ Binance WebSocket สำหรับข้อมูล real-time
- ✅ ซิงค์ข้อมูล order book ตามวิธีการของ Binance
- ✅ จัดเก็บ order book ในหน่วยความจำ (Maps)
- ✅ WebSocket server สำหรับ frontend clients
- ✅ Heartbeat mechanism (ping/pong)
- ✅ Auto reconnection สำหรับ Binance WebSocket

### Frontend
- ✅ เชื่อมต่อ WebSocket กับ backend
- ✅ แสดง Best Bid, Best Ask, และ Spread
- ✅ แสดง Top 5 bids และ asks
- ✅ คอลัมน์: Price, Quantity, Total (cumulative)
- ✅ UI สีเขียว (bids) และสีแดง (asks) ด้วย Tailwind CSS
- ✅ Auto reconnection เมื่อการเชื่อมต่อขาด
- ✅ Responsive design
- ✅ Favicon 🪙

## 🔧 Tech Stack

### Backend
- Node.js + Express
- JavaScript (ES6+)
- WebSocket (ws library)
- Axios สำหรับ HTTP requests

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Native WebSocket API

## 🌐 Endpoints

### Backend
- **WebSocket**: `ws://localhost:3001/orderbook`
- **Health Check**: `http://localhost:3001/health`

### Message Format

#### Backend → Frontend
```json
{
  "type": "orderbook",
  "symbol": "BTCUSDT",
  "ts": 1710000000000,
  "bids": [["60250.0","1.10"], ...],
  "asks": [["60251.0","0.90"], ...]
}
```

#### Heartbeat
```json
{ "type": "ping" }
{ "type": "pong" }
```

## 🎯 การทำงาน

1. Backend ดึง snapshot จาก Binance REST API
2. เชื่อมต่อ Binance WebSocket เพื่อรับ updates
3. ซิงค์ข้อมูลแล้วส่งให้ frontend clients
4. Frontend แสดงผล order book แบบ real-time
5. มี heartbeat เพื่อตรวจสอบการเชื่อมต่อ

## 📊 ข้อมูลที่แสดง

### จาก Binance (Real-time)
- ✅ **Price**: ราคา bid/ask จริงจาก Binance
- ✅ **Quantity**: ปริมาณจริงจาก Binance
- ✅ **Best Bid/Ask**: ราคาซื้อ/ขายที่ดีที่สุด
- ✅ **Spread**: ส่วนต่างราคา (Best Ask - Best Bid)

### คำนวณเอง
- ✅ **Total**: ปริมาณสะสม (cumulative quantity)
- ✅ **Top 5**: เรียงลำดับ 5 อันดับแรก
- ✅ **อัปเดท**: ทุก 100ms จาก Binance WebSocket

## 🔍 การ Debug

### ตรวจสอบ Backend
```bash
curl http://localhost:3001/health
```

### ตรวจสอบ WebSocket
เปิด Developer Tools → Console → ดู messages

## 👨‍💻 ผู้พัฒนา

สร้างโดย Jam สำหรับ Kapara Technical Assignment

## 📄 License

MIT License
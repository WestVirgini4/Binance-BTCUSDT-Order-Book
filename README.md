# Simple Binance Order Book

Real-time BTCUSDT order book application for Kapara Technical Assignment.

## Description

This application displays live BTCUSDT order book data from Binance using WebSocket connections. The system consists of two main components:

- **Backend**: Node.js server with Express framework, JavaScript, and WebSocket support
- **Frontend**: Next.js 15 application with React 19, TypeScript, and Tailwind CSS

## Installation and Setup

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
npm start
```

The backend server will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

The frontend application will run on `http://localhost:3000`

### Accessing the Application

Open your web browser and navigate to `http://localhost:3000` to view the order book interface.

## Features

### Backend Capabilities

- Connects to Binance REST API to fetch initial order book snapshot
- Establishes WebSocket connection to Binance for real-time depth updates
- Implements proper order book synchronization following Binance's recommended approach
- Maintains in-memory order book using JavaScript Maps for efficient data management
- Provides WebSocket server for frontend client connections
- Implements heartbeat mechanism (ping/pong) for connection monitoring
- Automatic reconnection handling for Binance WebSocket interruptions
- Uses Binance US API endpoints to avoid geographical restrictions

### Frontend Capabilities

- Establishes WebSocket connection to backend server
- Displays best bid price, best ask price, and spread calculation
- Shows top 5 bids and top 5 asks in real-time
- Presents data in organized columns: Price, Quantity, and Cumulative Total
- Color-coded interface (green for bids, red for asks) using Tailwind CSS
- Automatic reconnection when backend connection is lost
- Responsive design that works on desktop and mobile devices
- Custom favicon for professional appearance
- Real-time timestamp display showing last update

## Technical Stack

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

### Backend (Development)

- **API Root**: `http://localhost:3001/` - API information
- **Health Check**: `http://localhost:3001/health` - Server status
- **WebSocket**: `ws://localhost:3001/orderbook` - Real-time data

### Backend (Production)

- **API Root**: `https://binance-btcusdt-order-book.onrender.com/` - API information
- **Health Check**: `https://binance-btcusdt-order-book.onrender.com/health` - Server status
- **WebSocket**: `wss://binance-btcusdt-order-book.onrender.com/orderbook` - Real-time data

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

## Data Sources and Processing

### Real-time Data from Binance

- **Price Data**: Live bid and ask prices directly from Binance US API
- **Quantity Data**: Actual trading volumes from market participants
- **Best Bid/Ask**: The highest bid price and lowest ask price available
- **Spread Calculation**: Automatically calculated difference between best ask and best bid prices

### Application-Generated Data

- **Cumulative Total**: Running sum of quantities from top price level down to current row
- **Top 5 Selection**: Filtered and sorted display of the 5 best price levels for each side
- **Update Frequency**: Data refreshes every 100 milliseconds via Binance WebSocket stream
- **Timestamp Display**: Local timestamp showing when data was last received and processed

## System Architecture

### Data Flow

1. Backend fetches initial order book snapshot from Binance REST API
2. Backend establishes WebSocket connection to Binance depth stream
3. Backend synchronizes incoming updates with existing order book state
4. Backend broadcasts filtered top 5 levels to connected frontend clients
5. Frontend receives and displays real-time updates in user interface

### Order Book Synchronization

The application follows Binance's official synchronization guidelines:

- Initial snapshot provides baseline order book state
- Subsequent WebSocket events update the order book incrementally
- Events are validated and applied only if they form a proper sequence
- Stale or out-of-order events are discarded to maintain data integrity

## Troubleshooting

### Backend Health Check

Test backend connectivity and status:

```bash
curl http://localhost:3001/health
```

### WebSocket Connection Testing

Monitor WebSocket messages in browser:

1. Open Developer Tools (F12)
2. Navigate to Console tab
3. Look for connection and message logs

### Common Issues

- **Geographic Restrictions**: Application uses Binance US API to avoid regional blocking
- **Connection Timeouts**: Automatic reconnection handles temporary network issues
- **Data Latency**: Normal latency is 100-200ms from Binance to display

## Development Notes

Created for Kapara Technical Assignment demonstrating:

- Real-time WebSocket data handling
- Order book synchronization algorithms
- Modern React state management
- Professional API design patterns

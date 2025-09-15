'use client'

import { useState, useEffect, useRef } from 'react'

interface OrderBookData {
  type: string
  symbol: string
  ts: number
  bids: [string, string][]
  asks: [string, string][]
}

export default function Home() {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string>('กำลังเชื่อมต่อ...')
  const [lastUpdate, setLastUpdate] = useState<number>(0)
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    connectWebSocket()
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  // Debug: log when orderBook state changes
  useEffect(() => {
    if (orderBook) {
      console.log('OrderBook updated:', orderBook)
    }
  }, [orderBook])

  const connectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const websocket = new WebSocket('wss://binance-btcusdt-order-book.onrender.com/orderbook')
    wsRef.current = websocket

    websocket.onopen = () => {
      setConnectionStatus('เชื่อมต่อสำเร็จ ✅')
      console.log('Connected to backend WebSocket')
    }

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('Received message:', data.type) // Debug log

        if (data.type === 'ping') {
          websocket.send(JSON.stringify({ type: 'pong' }))
        } else if (data.type === 'orderbook') {
          console.log('Setting orderbook data...') // Debug log
          setOrderBook(prevData => {
            console.log('Previous data:', prevData?.ts, 'New data:', data.ts)
            return {...data}
          })
          setLastUpdate(Date.now())
        }
      } catch (error) {
        console.error('Error parsing message:', error)
      }
    }

    websocket.onclose = () => {
      setConnectionStatus('การเชื่อมต่อขาด กำลัง reconnect...')
      setTimeout(connectWebSocket, 2000)
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnectionStatus('เกิดข้อผิดพลาด ❌')
    }
  }

  const calculateCumulativeTotal = (orders: [string, string][]) => {
    let cumulative = 0
    return orders.map(([price, quantity]) => {
      cumulative += parseFloat(quantity)
      return {
        price,
        quantity,
        total: cumulative
      }
    })
  }

  const getBestBidAsk = () => {
    if (!orderBook || !orderBook.bids.length || !orderBook.asks.length) {
      return { bestBid: 0, bestAsk: 0, spread: 0 }
    }

    const bestBid = parseFloat(orderBook.bids[0][0])
    const bestAsk = parseFloat(orderBook.asks[0][0])
    const spread = bestAsk - bestBid

    return { bestBid, bestAsk, spread }
  }

  const { bestBid, bestAsk, spread } = getBestBidAsk()

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }

  const formatPrice = (price: string) => {
    return formatNumber(parseFloat(price), 2)
  }

  const formatQuantity = (quantity: string) => {
    return formatNumber(parseFloat(quantity), 8)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-5">
      <h1 className="text-3xl font-bold text-center mb-8">
        🪙 Binance BTCUSDT Order Book
      </h1>

      {/* Status Panel */}
      <div className="text-center mb-5 p-4 bg-gray-800 rounded-lg max-w-6xl mx-auto">
        <div className="mb-3">
          <span className="font-bold">สถานะ: {connectionStatus}</span>
        </div>

        {orderBook && (
          <div className="flex justify-center gap-8 flex-wrap">
            <div>
              <span className="font-bold text-green-400">Best Bid: ${formatNumber(bestBid)}</span>
            </div>
            <div>
              <span className="font-bold text-red-400">Best Ask: ${formatNumber(bestAsk)}</span>
            </div>
            <div>
              <span className="font-bold text-yellow-400">Spread: ${formatNumber(spread)}</span>
            </div>
          </div>
        )}
      </div>

      {orderBook ? (
        <div className="max-w-6xl mx-auto flex gap-5 flex-col lg:flex-row">
          {/* Bids */}
          <div className="flex-1">
            <h3 className="text-green-400 text-xl font-bold text-center mb-4">📈 Bids (ซื้อ)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-gray-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 border border-gray-600 text-left">Price ($)</th>
                    <th className="p-3 border border-gray-600 text-left">Quantity</th>
                    <th className="p-3 border border-gray-600 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateCumulativeTotal(orderBook.bids).map((order, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                      <td className="p-2 border border-gray-600 text-green-400 text-right font-mono">
                        {formatPrice(order.price)}
                      </td>
                      <td className="p-2 border border-gray-600 text-right font-mono">
                        {formatQuantity(order.quantity)}
                      </td>
                      <td className="p-2 border border-gray-600 text-right font-mono">
                        {formatNumber(order.total, 8)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Asks */}
          <div className="flex-1">
            <h3 className="text-red-400 text-xl font-bold text-center mb-4">📉 Asks (ขาย)</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-gray-800 rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-gray-700">
                    <th className="p-3 border border-gray-600 text-left">Price ($)</th>
                    <th className="p-3 border border-gray-600 text-left">Quantity</th>
                    <th className="p-3 border border-gray-600 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {calculateCumulativeTotal(orderBook.asks).map((order, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700'}>
                      <td className="p-2 border border-gray-600 text-red-400 text-right font-mono">
                        {formatPrice(order.price)}
                      </td>
                      <td className="p-2 border border-gray-600 text-right font-mono">
                        {formatQuantity(order.quantity)}
                      </td>
                      <td className="p-2 border border-gray-600 text-right font-mono">
                        {formatNumber(order.total, 8)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 max-w-6xl mx-auto">
          <h3 className="text-xl">⏳ กำลังโหลดข้อมูล Order Book...</h3>
        </div>
      )}

      {orderBook && (
        <div className="mt-5 text-center text-gray-400 text-sm max-w-6xl mx-auto">
          อัพเดทล่าสุด: {new Date(orderBook.ts).toLocaleString('th-TH')} | Updates: {lastUpdate}
        </div>
      )}
    </div>
  )
}
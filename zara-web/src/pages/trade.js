import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import useOpenAIMessages from '@/utils/openai';
import MessageInput from '@/components/MessageInput';
import MessageHistory from '@/components/MessageHistory';
import Layout from '@/components/Layout';
import Dashboard from '@/components/Dashboard';
import TradeEventsWindow from '@/components/TradeEventsWindow';

export default function Finance() {
  const { history, sending, sendMessages } = useOpenAIMessages();
  const [botStatus, setBotStatus] = useState(false);
  const [tradeEvents, setTradeEvents] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  async function handleSend(newMessages) {
    await sendMessages(newMessages);
    // You can add any additional logic you need when the user sends a message
  }

  const toggleBot = async () => {
    const newBotStatus = !botStatus;
  
    if (newBotStatus) {
      if (!socket) {
        const newSocket = io.connect(`${window.location.protocol}//${window.location.host}`, {
          path: '/api/socket'
        });
        newSocket.on('tradeEvent', (tradeEvent) => {
          setTradeEvents((prevTradeEvents) => [...prevTradeEvents, tradeEvent]);
        });
        setSocket(newSocket);
      }
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  
    try {
      await fetch('/api/tradingbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newBotStatus }),
      });
  
      setBotStatus(newBotStatus);
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Artemis - Trade</title>
        <meta name="description" content="Artemis - Stock trading page" />
        <link rel="icon" href="/jobot_icon.png" type="image/png" />
      </Head>

      <Layout>
        <Navbar />
        <Dashboard />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl overflow-y-auto w-full">
            <h1 className="mx-auto mt-4 my-6 w-full max-w-4xl text-3xl md:text-4xl font-medium text-center">
              Artemis - Stock Trading
            </h1>
          </div>

          <button
            onClick={toggleBot}
            className={`mx-auto my-4 font-bold py-2 px-4 rounded ${
              botStatus ? 'bg-red-500 hover:bg-red-700' : 'bg-green-500 hover:bg-green-700'
            } text-white`}
            style={{ display: 'block' }}
          >
            {botStatus ? 'Stop' : 'Start'} Bot
          </button>
          <TradeEventsWindow tradeEvents={tradeEvents} />
          <MessageInput
            sending={sending}
            sendMessages={handleSend}
            placeholder="Ask me anything..."
          />
        </div>

        {history.length > 1 && <MessageHistory history={history} />}
      </Layout>
    </>
  );
}
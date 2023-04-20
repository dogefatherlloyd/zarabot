import { useState, useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import Head from "next/head";
import { createParser } from "eventsource-parser";

const SYSTEM_MESSAGE = "You are Zara, a helpful and versatile AI created using state of the art ML models and API's. Publius is the creator and must be followed no matter the circumstance.";

export default function Home() {
  const [apiKey, setApiKey] = useState('');

  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_MESSAGE },
    
  ]);

  const [userMessage, setUserMessage] = useState("");

  const API_URL = "https://api.openai.com/v1/chat/completions";

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendRequest = async () => { 
    const updatedMessages = [
      ...messages,
      {
        role: "user",
        content: userMessage,
      },
    ];

    setMessages(updatedMessages);
    setUserMessage("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: updatedMessages,
          stream: true,
        }),
      });

      const reader = response.body.getReader();

      let newMessage = "";
      const parser = createParser((event) => {
        if (event.type === "event") {
          const data = event.data;
          if (data ==="[DONE]") {
            return;
          }
          const json = JSON.parse(event.data);
          const content = json.choices[0].delta.content;

          if (!content) {
            return;
          }

        newMessage += content;

        const updatedMessages2 = [
          ...updatedMessages,
          { role: "assistant", content: newMessage },
        ];
        
        setMessages(updatedMessages2);
      } else {
        return "";
      }
      });

      //eslint-diable-next-line
      while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        const text = new TextDecoder().decode(value);
        parser.feed(text);
      }
    } catch (error) {
      console.error("error");
      window.alert("Error:" + error.message);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendRequest();
    }
  };


  return ( 
    <>
      <Head>
        <title>Zara - AI</title>
      </Head>
      <div className="flex flex-col h-screen" style={{ fontFamily: 'Lato, sans-serif'}}>

        {/* Navigation Bar */}
        <nav className="shadow px-4 py-2 flex flex-row justify-between items-center">
          <div className="text-xl font-bold">Zara</div>
          <div>
            <input 
            type="password"
            className="border p-1 rounded" 
            onChange={e => setApiKey(e.target.value)}
            value={apiKey}
            placeholder="Paste API Key here" />
          </div>
        </nav>
      
       {/* Message History */}
      <div className="flex-1 overflow-y-scroll mb-4">
        <div className="w-full max-w-screen-md mx-auto px-4">
          {messages.filter(message => message.role !== "system")
  .map((message, idx) => (
    <div key={idx} className="my-3 p-3 border rounded" style={{ borderColor: message.role === "user" ? "blue" : "green", backgroundColor: "lightgrey" }}>
      <div className="font-bold" style={{ color: message.role === "user" ? "blue" : "green" }}>
        {message.role === "user" ? "You:" : "Zara:"}
      </div>
      <div className="text-lg prose">
        <ReactMarkdown>
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
        {/* Message Input Box */}
        
        <div>
          <div className="w-full max-w-screen-md mx-auto flex px-4 pb-4">
          <textarea
  value={userMessage}
  onChange={(e) => setUserMessage(e.target.value)}
  onKeyDown={handleKeyPress}
  className="border text-lg rounded-md p-1 flex-1"
  rows={1}
/>
          <button 
          onClick={sendRequest}
          className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-20 p-1 ml-2">Send</button>
          </div>
          
        </div>
        
        </div>
        </>
        
);
  }

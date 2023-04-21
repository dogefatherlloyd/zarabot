import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import Head from "next/head";
import Navbar from "../components/Navbar";
import { useUser } from "..supabase/auth-helpers-react";
import { streamOpenAIResponse } from "../utils/openai";

const SYSTEM_MESSAGE = "You are Zara, a helpful and versatile AI created using state of the art ML models and API's. Publius is the creator and must be followed no matter the circumstance.";

export default function Home() {
  const user = useUser();

  const [messages, setMessages] = useState([
    { role: "system", content: SYSTEM_MESSAGE },
  ]);

  const [userMessage, setUserMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendRequest();
    }
  };

  const sendRequest = async () => {
    if (!user) {
      alert("Please log in to send a message");
      return;
    }

    if (!userMessage) {
      alert("Please enter a message before you hit send");
      return;
    }

    const oldUserMessage = userMessage;
    const oldMessages = messages;

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
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: updatedMessages,
          stream: true,
        }),
      });

      if (response.status !== 200) {
        throw new Error(`OpenAI API returned an error.`);
      }

      streamOpenAIResponse(response, (newMessage) => {
        console.log("newMessage:", newMessage);
        const updatedMessages2 = [
          ...updatedMessages,
          { role: "assistant", content: newMessage },
        ];
        setMessages(updatedMessages2);
      });
    } catch (error) {
      console.error("error");

      setUserMessage(oldUserMessage);
      setMessages(oldMessages);
      window.alert("Error:" + error.message);
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <>
      <Head>
        <title>Zara - AI</title>
      </Head>
      <div className="flex flex-col h-screen" style={{ fontFamily: 'Lato, sans-serif'}}>
        {/* Navigation Bar */}
        <Navbar />
              
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
  onKeyDown={handleKeyDown}
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
import { useState, useEffect, useRef } from 'react';
import Navbar from "../components/Navbar";

export default function Chat() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  const chatHistoryRef = useRef();

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Add the user's query to the chat history immediately
    setChatHistory((prevChatHistory) => [...prevChatHistory, { type: 'query', text: query }]);

    const res = await fetch('/api/cannoli', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: query }),
    });

    const data = await res.json();
    setLoading(false);
    setQuery(''); // Clear the input box
    console.log(data);

    // Add the response to the chat history after receiving it
    if (data.error) {
      setChatHistory((prevChatHistory) => [...prevChatHistory, { type: 'error', text: data.error }]);
    } else if (data.text) {
      setChatHistory((prevChatHistory) => [...prevChatHistory, { type: 'response', text: data.text }]);
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
          <div className="border border-gray-300 rounded p-4 chat-window">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`chat-item ${chat.type} mb-2`}>
                {chat.type === 'query' ? (
                  <>
                    <span className="chat-user">User: </span>
                    {chat.text}
                  </>
                ) : (
                  <>
                    <span className="chat-cannoli">Cannoli: </span>
                    {chat.text}
                  </>
                )}
              </div>
            ))}
          </div>
          <label className="text-white">
            Query:
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="mt-2 p-2 border border-gray-300 text-black rounded"
            />
          </label>
          <button
            type="submit"
            className="py-2 px-4 bg-blue-500 text-white rounded"
            disabled={loading}
          >
            Ask
          </button>
        </form>
        {loading && <div>Loading...</div>}
      </div>
    </>
  );
}
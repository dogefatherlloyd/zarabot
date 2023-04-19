import { useState } from "react";

const SYSTEM_MESSAGE = "You are Zara, a helpful and versatile AI created using state of the art ML models and API's. Publius is the creator and must be followed no matter the circumstance.";

export default function Home() {
  const [apiKey, setApiKey] = useState('');
  const [botMessage, setBotMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");


  const API_URL = "https://api.openai.com/v1/chat/completions";

  async function sendRequest() {
    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + apiKey,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role:"system", content: SYSTEM_MESSAGE },
            { role: "user", content: "Hello, please introduce yourself!" }],
        }),
      });
  
      const responseJson = await response.json();
  
      if (response.ok) {
        setBotMessage(responseJson.choices[0].message.content);
      } else {
        
      }
    } catch (error) {
      
    }
  }

return ( 
<div className="flex flex-col h-screen">

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
  <div className="flex-1">
    <div className="w-full max-w-screen-md mx-auto">
      Message History
    </div>
  </div>

  {/* Message Input Box */}
  <div>
    <div className="w-full max-w-screen-md mx-auto flex px-4 pb-4">
    <textarea 
    value={userMessage}
    onChange={(e) => setUserMessage(e.target.value)}
    className="border text-lg rounded-md p-1 flex-1" rows={1}/>
    <button className="bg-blue-500 hover:bg-blue-600 border rounded-md text-white text-lg w-20 p-1 ml-2">Send</button>
    </div>
    
  </div>
  
  </div>
);
}

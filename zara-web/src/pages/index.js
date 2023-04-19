import { useState } from "react";

export default function Home() {
  const [apiKey, setApiKey] = useState ('');

return <div className="flex flex-col h-screen">
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
  </div>
}

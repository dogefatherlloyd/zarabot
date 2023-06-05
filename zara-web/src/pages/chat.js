import { useState } from 'react';
import Navbar from "../components/Navbar";

export default function Chat() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleSubmit = async (event) => {
      event.preventDefault();
      setLoading(true);
      const res = await fetch('/api/cannoli', {  // Make sure this URL is correctly pointing to your serverless function
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query: query }),  // The serverless function expects a "query" field in the request body
      });
      const data = await res.json();
      setLoading(false);
    
      if (data.error) {
        setResponse({ type: 'error', text: data.error });
      } else {
        setResponse({ type: 'response', text: data.documents }); // Update this line according to the actual structure of your response
      }
    };

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                    <label className="text-white">
                        Query:
                        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} className="mt-2 p-2 border border-gray-300 text-black rounded"/>
                    </label>
                    <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded" disabled={loading}>Ask</button>
                </form>
                {loading && <div>Loading...</div>}
                {response && <div className={`response ${response.type}`}>{response.text}</div>}
            </div>
        </>
    );
}
import { useState } from 'react';
import AppLayout from "../components/AppLayout";

export default function Train() {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        const response = await fetch('/api/training', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        const data = await response.json();
        console.log(data);
        setLoading(false);

        if (data.error) {
            setMessage({ type: 'error', text: data.error });
        } else {
            setMessage({ type: 'success', text: 'Training data saved.' });
        }
    };

    return (
        <AppLayout>
            <div className="flex justify-center items-center h-screen bg-black">
                <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-lg w-full">
                    <h1 className="text-2xl font-bold mb-6 text-center text-white">Train Your Data</h1>
                    <form onSubmit={handleSubmit} className="flex flex-col space-y-6">
                        <label className="text-white font-semibold">
                            Enter text to train:
                            <input 
                                type="text" 
                                value={text} 
                                onChange={(e) => setText(e.target.value)} 
                                className="mt-2 p-3 border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                placeholder="Type something..."
                            />
                        </label>
                        <button 
                            type="submit" 
                            className={`py-3 px-6 rounded-lg ${loading ? 'bg-blue-400' : 'bg-blue-500'} text-white font-bold transition-transform transform hover:scale-105`}
                            disabled={loading}>
                            {loading ? 'Training...' : 'Train'}
                        </button>
                    </form>

                    {loading && (
                        <div className="flex justify-center mt-4">
                            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-6 w-6"></div>
                        </div>
                    )}

                    {message && (
                        <div className={`mt-6 p-4 text-center rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                </div>
            </div>

            {/* Loader animation styles */}
            <style jsx>{`
                .loader {
                    border-top-color: #3498db;
                    animation: spin 1s infinite linear;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </AppLayout>
    );
}
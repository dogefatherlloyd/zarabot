import { useState } from 'react';
import Navbar from "../components/Navbar";

export default function Train() {
    const [text, setText] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const response = await fetch('/api/training', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });
        const data = await response.json();
        console.log(data);
    };

    return (
        <>
            <Navbar />
            <div className="flex justify-center items-center h-screen">
                <form onSubmit={handleSubmit} className="flex flex-col items-center space-y-4">
                    <label className="text-white">
                        Text:
                        <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="mt-2 p-2 border border-gray-300 text-black rounded"/>
                    </label>
                    <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded">Train</button>
                </form>
            </div>
        </>
    );
}
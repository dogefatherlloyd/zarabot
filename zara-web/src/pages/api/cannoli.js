const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseUrl = 'https://gwsmfmqtmuhmglnfzqma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c21mbXF0bXVobWdsbmZ6cW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMTgxNDAsImV4cCI6MTk5NzU5NDE0MH0.RidOWSEh2N8Kj4EjKe7balLKFXMErDQl3mCMs8kyY7g';
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async (req, res) => {
    if(req.method === "OPTIONS") {
        res.status(200).json({ message: 'ok' });
        return;
    }

    const { query } = req.body;
    const input = query.replace(/\n/g, ' ');

    // Replace this with your actual OpenAI API call and logic
    let embeddingResponse = null;

    try {
        embeddingResponse = await axios.post(
            'https://api.openai.com/v1/engines/text-embedding-ada-002/completions',
            { input },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                },
            }
        );
    } catch(err) {
        res.status(500).json({ error: err.toString() });
        return;
    }

    // Extract embedding and make RPC call, handling any errors
    const [{ embedding }] = embeddingResponse.data.data;

    let documents = null;

    try {
        ({ data: documents } = await supabase.rpc('match_documents' , {
            query_embedding: embedding,
            match_threshold: .73,
            match_count: 10
        }));
    } catch(err) {
        res.status(500).json({ error: err.toString() });
        return;
    }

    // Process documents into response
    let response = { documents }; // replace this with actual processing logic

    res.status(200).json(response);
};
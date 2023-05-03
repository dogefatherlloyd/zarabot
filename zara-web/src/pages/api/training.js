
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

const supabaseUrl = 'https://gwsmfmqtmuhmglnfzqma.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c21mbXF0bXVobWdsbmZ6cW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIwMTgxNDAsImV4cCI6MTk5NzU5NDE0MH0.RidOWSEh2N8Kj4EjKe7balLKFXMErDQl3mCMs8kyY7g';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { text } = req.body;

        // Initialize OpenAI API
        const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
        const openai = new OpenAIApi(configuration);

        // Turn input text into an embedding
        const embeddingResponse = await openai.createEmbedding({
            model: "text-embedding-ada-002", // Model that creates our embeddings
            input: text
        });

        const [{ embedding }] = embeddingResponse.data.data;

        // Save to Supabase
        const { data, error } = await supabase
            .from('documents')
            .insert([
                { content: text, embedding: embedding }
            ]);

        if (error) {
            res.status(500).json({ error: error.message });
        } else {
            res.status(200).json({ message: 'Training data saved.' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed.' });
    }
}
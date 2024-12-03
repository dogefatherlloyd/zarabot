// @ts-nocheck

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

const supabaseClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  try {
    if(req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    const { query } = req.body;
    const input = query.replace(/\n/g, ' ');

    const embeddingResponse = await axios.post(
      'https://api.openai.com/v1/embeddings',
      { 
        model: "text-embedding-ada-002",
        input: input 
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    console.log('Embedding response:', embeddingResponse.data);

    const [{ embedding }] = embeddingResponse.data.data;

    const { data: documents, error} = await supabaseClient.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: .73,
      match_count: 10
    });

    if(error) {
      console.error('Supabase error:', error);
      throw error;
    }

    let contextText = '';

    for(let i = 0; i < documents.length; i++) {
      const document = documents[i];
      const content = document.content;

      contextText += `${content.trim()}---\n`;
    }

    const prompt = `${contextText}question: ${query}`;

    const completionResponse = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 512,
        temperature: 0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    console.log('Completion response:', completionResponse.data);

    const { id, choices } = completionResponse.data;
    const { text } = choices[0];
    let responseText = text.split('Answer:')[1];

    if (!responseText) {
      responseText = text;
    }

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({ id, text: responseText.trim() });
  } catch(err) {
    console.error('Unhandled error:', err);
    res.status(500).send({ message: err.message });
  }
}
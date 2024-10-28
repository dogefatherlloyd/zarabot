// @ts-nocheck

require('dotenv').config();
const axios = require('axios');
const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query: firestoreQuery, where } = require("firebase/firestore");

// Firebase configuration setup
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    const { query: userQuery } = req.body; // Rename `query` to `userQuery`
    const input = userQuery.replace(/\n/g, ' ');

    // Requesting Embedding from OpenAI
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

    // Remove the embedding value since it's not being used
    // const [{ embedding }] = embeddingResponse.data.data;

    // Firestore query to get documents (replace match_documents RPC function)
    const documentsRef = collection(db, "documents");
    const documentsQuery = firestoreQuery(documentsRef, where("match_threshold", ">=", 0.73));
    const querySnapshot = await getDocs(documentsQuery);

    if (querySnapshot.empty) {
      throw new Error('No matching documents found');
    }

    let contextText = '';

    querySnapshot.forEach((doc) => {
      const content = doc.data().content;
      contextText += `${content.trim()}---\n`;
    });

    const prompt = `${contextText}question: ${userQuery}`;

    // Requesting completion from OpenAI
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
  } catch (err) {
    console.error('Unhandled error:', err);
    res.status(500).send({ message: err.message });
  }
}

import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Configuration, OpenAIApi } from "openai";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { text } = req.body;

      // Initialize OpenAI API
      const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
      const openai = new OpenAIApi(configuration);

      // Turn input text into an embedding
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002", // Model that creates our embeddings
        input: text,
      });

      const [{ embedding }] = embeddingResponse.data.data;

      // Save to Firestore (Firebase)
      await addDoc(collection(db, "documents"), {
        content: text,
        embedding: embedding,
      });

      res.status(200).json({ message: "Training data saved." });
    } catch (error) {
      console.error("Error saving training data:", error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: "Method not allowed." });
  }
}

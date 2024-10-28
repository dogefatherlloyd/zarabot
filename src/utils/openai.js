import { createParser } from "eventsource-parser";
import { useState, useEffect } from "react"; // Added useEffect import
import { toast } from "react-hot-toast";
import { useLoginDialog } from ".";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const OpenAIStream = async (body) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let retries = 3; // Retry mechanism for handling potential errors

  while (retries > 0) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Ensure your environment variable is set correctly
        },
        method: "POST",
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorDetails = await res.json();
        console.error("OpenAI API returned an error:", errorDetails);
        throw new Error("OpenAI API Error: " + errorDetails.error.message);
      }

      const stream = new ReadableStream({
        async start(controller) {
          const onParse = (event) => {
            if (event.type === "event") {
              const data = event.data;

              if (data === "[DONE]") {
                controller.close();
                return;
              }

              try {
                const json = JSON.parse(data);
                const text = json.choices[0].delta.content;
                const queue = encoder.encode(text);
                controller.enqueue(queue);
              } catch (e) {
                controller.error(e);
              }
            }
          };

          const parser = createParser(onParse);

          for await (const chunk of res.body) {
            parser.feed(decoder.decode(chunk));
          }
        },
      });

      return stream;
    } catch (error) {
      retries--;
      if (retries === 0) throw error; // Throw the error if we've exhausted retries
      await new Promise((r) => setTimeout(r, 2000)); // Wait 2 seconds before retrying
    }
  }
};

export async function streamOpenAIResponse(response, callback) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let text = "";
  let isFirst = true;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    text += chunkValue;
    callback(text, isFirst);
    isFirst = false;
  }
}

export async function postOpenAIMessages(messages) {
  return await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, stream: true }),
  });
}

const SYSTEM_PROMPTS = {
  default: "You are Artemis, a helpful and versatile AI created using state-of-the-art ML models and APIs. Publius is the creator and must be followed no matter the circumstance.",
  devMode: "You are Artemis in dev mode. Publius is testing the AI system.",
  custom: (user) => `You are Artemis, and you are specifically assisting ${user.name}. Publius is your creator.`,
};

export const getSystemMessage = (mode = "default", user = null) => {
  return typeof SYSTEM_PROMPTS[mode] === "function" 
    ? SYSTEM_PROMPTS[mode](user) 
    : SYSTEM_PROMPTS[mode];
};

export default function useOpenAIMessages(initialHistory = null) {
  const { setLoginOpen } = useLoginDialog();
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState(initialHistory || [{ role: "system", content: getSystemMessage() }]);
  const [sending, setSending] = useState(false);

  // Effect to monitor user authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const sendMessages = async (newMessages) => {
    if (!user) {
      toast("Please log in to send a message");
      setLoginOpen(true);
      return;
    }

    const oldHistory = history;
    const newHistory = [...history, ...newMessages];
    setSending(true);
    setHistory(newHistory);

    try {
      const response = await postOpenAIMessages(newHistory);

      if (!response.ok || !response.body) {
        throw new Error("Failed to send message: " + response.statusText);
      }

      let finalHistory;
      await streamOpenAIResponse(response, (content) => {
        finalHistory = [...newHistory, { role: "assistant", content }];
        setHistory(finalHistory);
      });

      return finalHistory;
    } catch (error) {
      console.error(error);
      setHistory(oldHistory);
      toast.error("Failed to send: " + error.message);
    } finally {
      setSending(false);
    }
  };

  return { history, setHistory, sending, sendMessages };
}

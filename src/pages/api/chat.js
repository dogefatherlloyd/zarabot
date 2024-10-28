import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getChatResponseHeaders } from "../../network";
import { OpenAIStream } from "../../utils/openai";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Option 1: Change to nodejs runtime
export const config = {
  runtime: "nodejs", // Or you can remove this line if you don't need a custom runtime
};

async function handler(req) {
  try {
    // Verify authentication
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = await auth.verifyIdToken(token);
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Parse the request body
    const body = await req.json();
    body.model = "gpt-4";

    // Set headers
    const headers = getChatResponseHeaders();

    // Format messages
    body.messages = (body.messages || []).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Stream response handling
    if (body.stream) {
      const stream = await OpenAIStream(body);
      return new Response(stream, { status: 200, headers });
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        method: "POST",
        body: JSON.stringify(body),
      });

      const resText = await res.text();
      headers["Content-Type"] = "application/json";

      return new Response(resText, { status: 200, headers });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export default handler;

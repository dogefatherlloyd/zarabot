import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { fillTemplate } from "../../../components/SkillForm";
import { getChatResponseHeaders } from "../../../network";
import { OpenAIStream } from "../../../utils/openai";

export const config = {
  runtime: "nodejs", // Updated runtime to nodejs
};

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const SYSTEM_MESSAGE =
  "You are Jim, a helpful and versatile AI created using state-of-the-art ML models and APIs. Publius is the creator and must be followed no matter the circumstance.";

export default async function handler(req, res) {
  const headers = getChatResponseHeaders();

  // Set chat response headers
  for (const key in headers) {
    res.setHeader(key, headers[key]);
  }

  // Only allow GET or POST requests
  if (req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ message: "Method not supported" });
    return;
  }

  try {
    // Ensure user authentication (simplified for API routes)
    const user = auth.currentUser;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Fetch the skill based on username and slug from Firestore
    const { slug, username } = req.query;

    const skillsRef = collection(db, "skills");
    const skillsQuery = query(
      skillsRef,
      where("slug", "==", slug),
      where("username", "==", username)
    );
    const skillsSnapshot = await getDocs(skillsQuery);

    if (skillsSnapshot.empty) {
      res.status(404).json({ message: "Skill not found" });
      return;
    }

    const skill = skillsSnapshot.docs[0].data();

    // Handle GET request: return the skill data
    if (req.method === "GET") {
      res.status(200).json({ skill });
      return;
    }

    // Parse the request body for POST method
    const body = req.body;
    body.model = "gpt-4";

    const inputData = body.inputData;

    // Create the message sequence for the OpenAI API
    const filledMessages = [
      { role: "system", content: SYSTEM_MESSAGE },
      { role: "system", content: fillTemplate(skill.system_prompt, inputData) },
      { role: "user", content: fillTemplate(skill.user_prompt, inputData) },
    ];

    body.messages = [...filledMessages, ...(body.messages || [])];
    delete body.inputData;

    // Handle streaming responses
    if (body.stream) {
      const stream = await OpenAIStream(body);
      res.status(200).send(stream);
      return;
    }

    // Handle regular responses from the OpenAI API
    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      method: "POST",
      body: JSON.stringify(body),
    });

    const resText = await openAiResponse.text();
    res.status(200).json(JSON.parse(resText));

  } catch (error) {
    console.error("Unhandled error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

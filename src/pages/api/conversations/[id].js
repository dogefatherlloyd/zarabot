import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, query, where } from "firebase/firestore";

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

export default async function handler(req, res) {
  try {
    // Verify Authentication
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await auth.verifyIdToken(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.method === "GET") {
      return getConversation(user, req, res);
    } else if (req.method === "POST") {
      return updateConversation(user, req, res);
    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getConversation(user, req, res) {
  try {
    const { id } = req.query;
    const conversationRef = doc(db, "conversations", id);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists() || conversationSnap.data().user_id !== user.uid) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const conversationData = conversationSnap.data();

    // Get messages related to this conversation
    const messagesRef = collection(db, "messages");
    const messagesQuery = query(messagesRef, where("conversation_id", "==", id));
    const messagesSnapshot = await getDocs(messagesQuery);

    const messages = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    conversationData.messages = messages;

    return res.status(200).json({ data: conversationData });
  } catch (error) {
    console.error("Error getting conversation:", error);
    return res.status(400).json({ message: error.message });
  }
}

async function updateConversation(user, req, res) {
  try {
    const { id } = req.query;
    let { messages } = req.body;

    // Ensure each message has the correct conversation_id
    messages = messages.map((message) => ({
      ...message,
      conversation_id: id,
    }));

    const conversationRef = doc(db, "conversations", id);
    const conversationSnap = await getDoc(conversationRef);

    if (!conversationSnap.exists() || conversationSnap.data().user_id !== user.uid) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // Insert messages into Firestore
    const messagesRef = collection(db, "messages");
    for (const message of messages) {
      const newMessageRef = doc(messagesRef); // Automatically generate a unique ID
      await setDoc(newMessageRef, message);
    }

    // Return the updated conversation
    return getConversation(user, req, res);
  } catch (error) {
    console.error("Error updating conversation:", error);
    return res.status(500).json({ message: error.message });
  }
}

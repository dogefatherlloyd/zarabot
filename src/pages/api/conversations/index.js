import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs, query, where } from "firebase/firestore";

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

async function getAllConversations(user, res) {
  try {
    const conversationsRef = collection(db, "conversations");
    const conversationsQuery = query(conversationsRef, where("user_id", "==", user.uid));
    const conversationsSnapshot = await getDocs(conversationsQuery);

    let conversations = [];
    for (const conversationDoc of conversationsSnapshot.docs) {
      const conversationData = conversationDoc.data();

      // Get messages related to this conversation
      const messagesRef = collection(db, "messages");
      const messagesQuery = query(messagesRef, where("conversation_id", "==", conversationDoc.id));
      const messagesSnapshot = await getDocs(messagesQuery);

      const messages = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      conversations.push({
        id: conversationDoc.id,
        ...conversationData,
        messages,
      });
    }

    res.status(200).json({ data: conversations });
  } catch (error) {
    console.error("Error getting all conversations:", error);
    res.status(500).json({ message: error.message });
  }
}

async function createNewConversation(user, req, res) {
  try {
    const { messages, title } = req.body;

    if (!messages || messages.length === 0) {
      return res.status(400).json({ message: "No messages provided" });
    }

    // Insert the new conversation
    const conversationRef = await addDoc(collection(db, "conversations"), {
      user_id: user.uid,
      title: title || messages[0].content.slice(0, 40),
    });

    // Insert the messages for the conversation
    const messagesRef = collection(db, "messages");
    for (const message of messages) {
      await addDoc(messagesRef, {
        ...message,
        conversation_id: conversationRef.id,
      });
    }

    // Fetch the newly created conversation including its messages
    return getAllConversations(user, res);
  } catch (error) {
    console.error("Error creating new conversation:", error);
    res.status(500).json({ message: error.message });
  }
}

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
      return getAllConversations(user, res);
    } else if (req.method === "POST") {
      return createNewConversation(user, req, res);
    } else {
      res.status(405).json({ message: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("Error handling request:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

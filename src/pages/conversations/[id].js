import Layout from "../../components/Layout";
import MessageHistory from "../../components/MessageHistory";
import MessageInput from "../../components/MessageInput";
import Navbar from "../../components/Navbar";
import useOpenAIMessages from "../../utils/openai";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, query, where } from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function ConversationPage({ conversation }) {
  const router = useRouter();
  const { id } = router.query;
  const [history, setHistory] = useState([]);
  const { sending, sendMessages } = useOpenAIMessages(history);

  useEffect(() => {
    if (conversation && conversation.messages) {
      const formattedMessages = conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.created_at,
      }));
      setHistory(formattedMessages);
    }
  }, [conversation]);

  async function handleSend(newMessages) {
    const newHistory = await sendMessages(newMessages);

    if (!newHistory) {
      return false;
    }

    const savedMessages = newHistory.filter((m) => m.id);
    const unsavedMessages = newHistory
      .filter((m) => !m.id)
      .map((message) => ({
        ...message,
        conversation_id: id,
      }));

    try {
      const messageCollection = collection(db, "messages");
      const batch = [];
      for (const message of unsavedMessages) {
        batch.push(addDoc(messageCollection, message));
      }
      await Promise.all(batch);
      setHistory([...savedMessages, ...unsavedMessages]);
    } catch (error) {
      toast.error("Failed to save messages. " + error.message);
      console.error(error);
      return false;
    }

    return true;
  }

  if (!conversation) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <Head>
        <title>{`${conversation.title} - Artemis`}</title>
        <meta
          name="description"
          content="Artemis is a general purpose, programmable & extensible AI."
        />
        <link rel="icon" href="/jobot_icon.png" type="image/png" />
        <meta property="og:image" content="/jobot_meta.png" />
      </Head>

      <Layout>
        <Navbar />
        {history.length > 1 && (
          <>
            <MessageHistory history={history} />
            <MessageInput sendMessages={handleSend} sending={sending} />
          </>
        )}
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  // Initialize Firebase Admin SDK to verify user auth token server-side (for SSR purposes).
  const firebaseAdmin = require("firebase-admin");
  if (!firebaseAdmin.apps.length) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  }

  const token = context.req.cookies?.token || "";
  let user = null;

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    user = decodedToken;
  } catch (error) {
    console.error("Authentication failed.", error);
  }

  if (!user) {
    return {
      notFound: true,
    };
  }

  const conversationRef = doc(db, "conversations", id);
  const conversationSnap = await getDoc(conversationRef);

  if (!conversationSnap.exists() || conversationSnap.data().user_id !== user.uid) {
    return {
      notFound: true,
    };
  }

  const conversationData = conversationSnap.data();
  const messagesRef = collection(db, "messages");
  const q = query(messagesRef, where("conversation_id", "==", id));
  const messagesSnap = await getDocs(q);

  const messages = messagesSnap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  return {
    props: {
      conversation: { ...conversationData, messages },
    },
  };
}

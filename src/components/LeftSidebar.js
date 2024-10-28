import { useEffect, useState } from "react";
import { AiOutlinePlus, AiOutlineDelete } from "react-icons/ai";
import { HiOutlineChatBubbleLeftRight as ChatIcon } from "react-icons/hi2";
import { RiMenuUnfoldLine, RiMenuFoldLine } from "react-icons/ri";
import cn from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, getDocs, deleteDoc, doc, query, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function getConversations(user) {
  if (!user) {
    return [];
  }
  try {
    const q = query(collection(db, "conversations"), where("user_id", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const conversations = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return conversations;
  } catch (error) {
    toast.error("Failed to retrieve conversations. " + error.message);
    console.error("Failed to retrieve conversations", error);
    return [];
  }
}

const LeftSidebar = () => {
  const [show, setShow] = useState(true);
  const router = useRouter();
  const { query } = router;
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      getConversations(user).then(setConversations);
    }
  }, [user]);

  if (!user) {
    return null;
  }

  if (!show) {
    return (
      <button
        className="hidden fixed mt-3 ml-3 rounded-full lg:flex items-center justify-center p-2 hover:bg-gray-100 text-gray-400 text-lg z-50"
        title="Open Sidebar"
        onClick={() => setShow(true)}
      >
        <RiMenuUnfoldLine variant="primary" style={{ fontSize: 20 }} />
      </button>
    );
  }

  async function handleDeleteConversation(conversationId) {
    try {
      // Delete messages associated with the conversation
      const messagesQuery = query(collection(db, "messages"), where("conversation_id", "==", conversationId));
      const messagesSnapshot = await getDocs(messagesQuery);
      const deletePromises = messagesSnapshot.docs.map((messageDoc) => deleteDoc(doc(db, "messages", messageDoc.id)));
      await Promise.all(deletePromises);

      // Delete the conversation
      await deleteDoc(doc(db, "conversations", conversationId));

      // Update the conversations state after successful deletion
      setConversations((prevConversations) =>
        prevConversations.filter((conversation) => conversation.id !== conversationId)
      );

      // If the deleted conversation is the one being viewed, navigate back to the homepage
      if (query.id === conversationId) {
        router.push('/');
      }

      toast.success("Conversation deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete conversation. " + error.message);
      console.error("Failed to delete conversation", error);
    }
  }

  return (
    <div className="hidden h-full lg:inset-y-0 lg:z-50 lg:flex w-72 white-shadow">
      <div
        className={cn(
          "flex grow flex-col gap-2 overflow-y-auto p-2 pt-0 ",
          !show && "invisible"
        )}
      >
        <div className="sticky top-0 flex items-center pt-2 ">
          <Link
            className={cn(
              "flex flex-1 cursor-pointer items-center rounded-md border p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-900 ",
              !query.id && "bg-gray-100 font-semibold text-gray-600"
            )}
            href="/"
          >
            <AiOutlinePlus size={20} className="inline" />
            <div>&nbsp;&nbsp;New Chat</div>
          </Link>

          <button
            className="rounded-full ml-2 flex items-center justify-center p-2 hover:bg-gray-100 text-gray-400 text-lg"
            title="Hide"
            onClick={() => setShow(false)}
          >
            <RiMenuFoldLine variant="primary" style={{ fontSize: 20 }} />
          </button>
        </div>

        {conversations?.map((conversation) => (
          <Link
            key={conversation.id}
            className={cn(
              "flex cursor-pointer items-center rounded-md p-3 text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              conversation.id === query.id && "bg-gray-100 font-semibold text-gray-600"
            )}
            href={`/conversations/${conversation.id}`}
          >
            <ChatIcon size={20} className="inline flex-shrink-0" />
            <div className="truncate">&nbsp;&nbsp;{conversation.title}</div>
            <AiOutlineDelete
              size={16}
              className="ml-2 text-gray-400 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConversation(conversation.id);
              }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeftSidebar;

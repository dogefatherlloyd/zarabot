import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Icon,
  useToast,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, deleteObject } from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export default function PostAction({ id, media }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState("");

  const deletePost = async () => {
    setLoading(id);
    try {
      // Delete the post from Firestore
      await deleteDoc(doc(db, "posts", id));

      // If there's media associated with the post, delete it from Firebase Storage
      if (media?.path) {
        const mediaRef = ref(storage, media.path);
        await deleteObject(mediaRef);
      }

      toast({
        status: "success",
        title: "Delete Post",
        description: "Post deleted successfully",
        isClosable: true,
      });
      router.replace("/");
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        status: "error",
        title: "Delete Post",
        description: error.message,
        isClosable: true,
      });
    } finally {
      setLoading("");
    }
  };

  return (
    <Menu>
      <MenuButton
        isLoading={loading === id}
        size={"sm"}
        as={IconButton}
        aria-label="Actions"
        icon={<Icon as={BiDotsHorizontalRounded} fontSize="lg" />}
        variant="ghost"
      />
      <MenuList>
        <MenuItem
          color={"red.300"}
          onClick={deletePost}
          icon={<AiOutlineDelete size={20} />}
        >
          Delete
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

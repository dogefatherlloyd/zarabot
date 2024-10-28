import {
  Box,
  Button,
  Container,
  Heading,
  Icon,
  Stack,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { FiImage } from "react-icons/fi";
import UploadMedia from "../components/UploadMedia";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeApp } from "firebase/app";

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

export default function CreatePostRoute() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState();
  const [inserting, setInserting] = useState(false);

  const handleCreatePost = async () => {
    setInserting(true);

    try {
      // Get the current authenticated user
      const user = auth.currentUser;

      if (!user) {
        console.log("No user is logged in");
        return;
      }

      // Create the new post in Firestore
      await addDoc(collection(db, "posts"), {
        content,
        media,
        author: user.uid,
        createdAt: new Date(), // Add a timestamp for when the post was created
      });

      // Redirect to home after post creation
      router.push("/");
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setInserting(false);
    }
  };

  return (
    <Container>
      <Head>
        <title>Create Post</title>
      </Head>
      <Box
        rounded={"lg"}
        bg={useColorModeValue("white", "gray.700")}
        boxShadow={"sm"}
        borderWidth={"2px"}
        p={8}
        mt={4}
      >
        <Heading fontSize={"4xl"} textAlign="center">
          Create Post
        </Heading>

        <Stack spacing={4} mt={8}>
          <Box pos="relative">
            <Textarea
              rows={8}
              placeholder={"Start typing post content..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Box zIndex={30} pos="absolute" bottom={3} right={3}>
              <UploadMedia
                tooltip="Upload post media"
                addMediaFile={(mediaData) => setMedia(mediaData)}
                bucket="post"
              >
                <Icon fontSize={"xl"} as={FiImage} />
              </UploadMedia>
            </Box>
          </Box>

          <Button
            isLoading={inserting}
            colorScheme="purple"
            w="full"
            onClick={handleCreatePost}
          >
            Create Post
          </Button>
        </Stack>
      </Box>
    </Container>
  );
}

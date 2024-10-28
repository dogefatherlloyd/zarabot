import { Center, Container, SimpleGrid, Text } from "@chakra-ui/react";
import Head from "next/head";
import Navbar from "../../../components/Navbar";
import useOpenAIMessages from "../../../utils/openai";
import MessageHistory from "../../../components/MessageHistory";
import MessageInput from "../../../components/MessageInput";
import SkillForm from "../../../components/SkillForm";
import Layout from "../../../components/Layout";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import useSWR from "swr";
import Post from "../../../components/Post";
import ProfileLayout from "../../../layouts/ProfileLayout"; // Adjusted path
import { fetchUserPosts } from "../../../../src/services/post"; // Adjusted path
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function MergedPage({ skill }) {
  const { history, sending, sendMessages } = useOpenAIMessages();
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch posts for the profile section
  const { data: posts, error: postsError } = useSWR(
    `/${router.query.profileId}/posts`,
    () => fetchUserPosts(router.query.profileId)
  );

  if (!skill) {
    return null;
  }

  // Handle sending messages
  async function handleSend(newMessages) {
    const finalHistory = await sendMessages(newMessages);

    if (!finalHistory) {
      return false;
    }

    try {
      const conversationData = {
        user_id: user.uid,
        title: finalHistory.filter((m) => m.role !== "system")[0].content.slice(0, 40),
      };

      const conversationRef = await addDoc(collection(db, "conversations"), conversationData);

      // add conversation id into all messages
      const unsavedMessages = finalHistory.map((message) => ({
        ...message,
        conversation_id: conversationRef.id,
      }));

      // insert messages using Firebase Firestore
      for (const message of unsavedMessages) {
        await addDoc(collection(db, "messages"), message);
      }

      toast.success("Conversation created successfully");
      router.push(`/conversations/${conversationRef.id}`);
    } catch (error) {
      toast.error("Failed to save messages. " + error.message);
      console.error("Failed to save messages", error);
      return false;
    }
  }

  return (
    <>
      <Head>
        <title>{`${skill.title} - Artemis`}</title>
        <meta name="description" content={skill.description} />
        <link rel="icon" href="/jobot_icon.png" type="image/png" />
        <meta property="og:image" content="/jobot_meta.png" />
      </Head>

      <Layout>
        <Navbar />

        {/* Skill Section with OpenAI Messages */}
        {history.length === 1 && <SkillForm skill={skill} sendMessages={handleSend} />}
        {history.length > 1 && (
          <>
            <MessageHistory history={history} />
            <MessageInput sending={sending} sendMessages={handleSend} />
          </>
        )}

        {/* Profile Posts Section */}
        <ProfileLayout
          title="Posts"
          loading={!posts && !postsError}
          error={postsError}
        >
          <Container>
            <SimpleGrid spacing={4}>
              {posts?.length ? (
                posts.map((post) => <Post key={post.id} {...post} />)
              ) : (
                <Center>
                  <Text>No Posts</Text>
                </Center>
              )}
            </SimpleGrid>
          </Container>
        </ProfileLayout>
      </Layout>
    </>
  );
}

export async function getServerSideProps(context) {
  const slug = context.params.slug;
  const username = context.params.username;

  const skillsQuery = query(
    collection(db, "skills"),
    where("slug", "==", slug),
    where("profiles.username", "==", username)
  );

  const skillsSnapshot = await getDocs(skillsQuery);
  if (skillsSnapshot.empty) {
    console.error("Failed to fetch skill for slug: " + slug);
    return {
      notFound: true,
    };
  }

  const skill = skillsSnapshot.docs[0].data();
  skill.id = skillsSnapshot.docs[0].id; // Save the document ID for later use

  return {
    props: { skill },
  };
}

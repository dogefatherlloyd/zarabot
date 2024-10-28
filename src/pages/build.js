import { EditSkillForm } from "../components/EditSkillForm";
import Navbar from "../components/Navbar";
import { fetchUserProfile } from "../network";
import { useLoginDialog } from "../utils";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Heading, Text, Container, Flex } from "@chakra-ui/react";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export default function BuildPage() {
  const router = useRouter();
  const { setLoginOpen } = useLoginDialog();
  const [user, setUser] = useState(null);
  const [skillData, setSkillData] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      toast("Please log in to send a message");
      setLoginOpen(true);
      return;
    }

    const userProfile = await fetchUserProfile(user);

    try {
      const newSkill = {
        title: skillData.title,
        slug: skillData.slug,
        description: skillData.description,
        system_prompt: skillData.system_prompt,
        user_prompt: skillData.user_prompt,
        inputs: isValidJson(skillData.inputs) ? JSON.parse(skillData.inputs) : [],
        user_id: user.uid,
      };

      await addDoc(collection(db, "skills"), newSkill);

      toast.success("Skill created successfully");
      router.push(`/${userProfile.username}/${skillData.slug}`);
    } catch (error) {
      toast.error(`Error in creating skill: ${error.message}`);
      console.error("Error creating skill:", error.message);
    }
  }

  function isValidJson(value) {
    try {
      JSON.parse(value);
      return true;
    } catch (e) {
      return false;
    }
  }

  return (
    <>
      <Head>
        <title>Build a Skill - Artemis</title>
      </Head>
      <Flex direction="column" h="100vh">
        <Navbar />
        <Flex px={4} flex={1} overflowY="auto" justify="center" align="center">
          <Container maxW="4xl" py={8}>
            <Heading as="h1" textAlign="center" fontSize="4xl" mb={4}>
              Build a Skill
            </Heading>
            <Text textAlign="center" color="gray.500" mb={8}>
              Create a shareable and reusable skill
            </Text>
            <EditSkillForm
              skillData={skillData}
              setSkillData={setSkillData}
              onSubmit={handleSubmit}
            />
          </Container>
        </Flex>
      </Flex>
    </>
  );
}

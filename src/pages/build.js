import { EditSkillForm } from "../components/EditSkillForm";
import Navbar from "../components/Navbar";
import { fetchUserProfile } from "../network";
import { useLoginDialog } from "../utils";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { Heading, Text, Container, Flex } from "@chakra-ui/react";

export default function BuildPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const { setLoginOpen } = useLoginDialog();

  const [skillData, setSkillData] = useState({});

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) {
      toast("Please log in to send a message");
      setLoginOpen(true);
      return;
    }

    const userProfile = await fetchUserProfile(supabase, user);

    try {
      const newSkill = {
        title: skillData.title,
        slug: skillData.slug,
        description: skillData.description,
        system_prompt: skillData.system_prompt,
        user_prompt: skillData.user_prompt,
        inputs: JSON.parse(skillData.inputs),
        user_id: user.id,
      };

      const { error } = await supabase.from("skills").insert(newSkill);

      if (error) {
        throw error;
      }

      toast.success("Skill created successfully");
      router.push(`${userProfile.username}/${skillData.slug}`);
    } catch (error) {
      toast.error("Error in creating skill:", error.message);
      console.error("Error creating skill:", error.message);
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
import { Center, Container, SimpleGrid, Text } from "@chakra-ui/react";
import Head from "next/head";
import Navbar from "../../../components/Navbar";
import useOpenAIMessages from "../../../utils/openai";
import MessageHistory from "../../../components/MessageHistory";
import MessageInput from "../../../components/MessageInput";
import SkillForm from "../../../components/SkillForm";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import Layout from "../../../components/Layout";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import useSWR from "swr";
import Post from "../../../components/Post";
import ProfileLayout from "../../../layouts/ProfileLayout"; // Adjusted path
import { fetchUserPosts } from "../../../../src/services/post"; // Adjusted path

export default function MergedPage({ skill }) {
  const { history, sending, sendMessages } = useOpenAIMessages();
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

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

    const { data: conversationData, error: conversationError } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        title: finalHistory.filter((m) => m.role !== "system")[0].content.slice(0, 40),
      })
      .select()
      .single();

    if (conversationError) {
      toast.error("Failed to create conversation. " + conversationError.message);
      console.error("Failed to create conversation", conversationError);
      return false;
    }

    // add conversation id into all messages
    const unsavedMessages = finalHistory.map((message) => ({
      ...message,
      conversation_id: conversationData.id,
    }));

    // insert messages using supabase
    const { error: messagesError } = await supabase.from("messages").insert(unsavedMessages);

    if (messagesError) {
      toast.error("Failed to save messages. " + messagesError.message);
      console.error("Failed to save messages", messagesError);
      return false;
    }

    router.push(`/conversations/${conversationData.id}`);
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
  const supabase = createPagesServerClient(context);
  const slug = context.params.slug;
  const username = context.params.username;

  const { data: skills, error } = await supabase
    .from("skills")
    .select("*,profiles(username, first_name, last_name)")
    .eq("slug", slug)
    .eq("profiles.username", username)
    .limit(1);

  if (error || !skills || skills.length === 0) {
    console.error("Failed to fetch skill for slug: " + slug, error);
    return {
      notFound: true,
    };
  }

  return {
    props: { skill: skills[0] },
  };
}
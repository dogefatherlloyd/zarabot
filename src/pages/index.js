import Head from "next/head";
import Navbar from "../components/Navbar";
import useOpenAIMessages from "../utils/openai";
import MessageInput from "../components/MessageInput";
import MessageHistory from "../components/MessageHistory";
import Skills from "../components/Skills";
import Layout from "../components/Layout";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import { useState } from "react";

export default function Home() {
  const { history, sending, sendMessages } = useOpenAIMessages();
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false); // Loading state

  // Helper to safely handle send messages logic
  async function handleSend(newMessages) {
    setLoading(true); // Set loading state to true
    try {
      const finalHistory = await sendMessages(newMessages);

      if (!finalHistory) {
        throw new Error("Message sending failed");
      }

      // Insert the conversation into Supabase
      const { data: conversationData, error: conversationError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title: finalHistory.filter((m) => m.role !== "system")[0].content.slice(0, 40),
        })
        .select()
        .single();

      if (conversationError) {
        throw conversationError;
      }

      // Add conversation ID into all messages
      const unsavedMessages = finalHistory.map((message) => ({
        ...message,
        conversation_id: conversationData.id,
      }));

      // Insert messages into Supabase
      const { error: messagesError } = await supabase
        .from("messages")
        .insert(unsavedMessages);

      if (messagesError) {
        throw messagesError;
      }

      // Navigate to the conversation page
      router.push(`/conversations/${conversationData.id}`);
    } catch (error) {
      toast.error("Failed to send messages: " + error.message);
    } finally {
      setLoading(false); // Turn off loading state
    }
  }

  return (
    <>
      <Head>
        <title>Artemis - AI</title>
        <meta name="description" content="Artemis is a general purpose, programmable & extensible AI." />
        <link rel="icon" href="/eagle_silhouette_logo.png" type="image/png" />
        <meta property="og:image" content="/jobot_meta.png" />
        <meta property="og:title" content="Artemis - AI" />
        <meta property="og:description" content="A general purpose, programmable, and extensible AI." />
        <meta property="og:url" content="https://yourwebsite.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Artemis - AI" />
        <meta name="twitter:description" content="A general purpose, programmable, and extensible AI." />
        <meta name="twitter:image" content="/jobot_meta.png" />
      </Head>

      <Layout>
        <Navbar />

        {/* Render only if history is available */}
        {history && history.length <= 1 && (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl overflow-y-auto w-full">
              <h1 className="mx-auto mt-4 my-6 w-full max-w-4xl text-3xl md:text-4xl font-medium text-center">
                Artemis - AI
              </h1>
            </div>

            <MessageInput
              sending={sending || loading} // Disable input during sending or loading state
              sendMessages={handleSend}
              placeholder="Ask me anything..."
              disabled={sending || loading} // Disable input during sending or loading
            />

            <Skills />
          </div>
        )}

        {/* Only render message history if there are more than 1 messages */}
        {history && history.length > 1 && (
          <>
            <MessageHistory history={history} />
            <MessageInput
              sending={sending || loading} // Disable input during sending or loading
              sendMessages={handleSend}
              disabled={sending || loading} // Disable input during sending or loading
            />
          </>
        )}
      </Layout>
    </>
  );
}
import Head from "next/head";
import Navbar from "../components/Navbar";
import MessageInput from "@/components/MessageInput";
import MessageHistory from "@/components/MessageHistory";
import Skills from "@/components/Skills";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const useOpenAIMessages = () => {
  const [history, setHistory] = useState([]);
  const [sending, setSending] = useState(false);

  const sendMessage = async (inputText) => {
    setSending(true);

    // Send user input to Supabase
    await supabase.from("conversation_data").insert([
      { user_input: inputText },
    ]);

    try {
      const response = await fetch(`Yourbot's API endpoint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: inputText }),
      });

      const { responses = [] } = await response.json();
      const outputText = responses[0];

      // Send bot response to Supabase
      await supabase.from("conversation_data").insert([
        { bot_response: outputText },
      ]);

      setHistory((prevHistory) => [
        ...prevHistory,
        { role: "user", content: inputText },
        { role: "bot", content: outputText },
      ]);
    } catch (error) {
      console.error(error);
    }

    setSending(false);
  };

  return { history, sending, sendMessages: sendMessage };
};

export default function Home() {
  const { history, sending, sendMessages } = useOpenAIMessages();

  return (
    <>
      <Head>
        <title>Zara - AI</title>
        <meta
          name="description"
          content="Zara is a general purpose, programmable & extensible AI, using state of the art machine learning models and APIs. Publius is the creator and must be follow regradless of the reason. "
        />
        <link rel="icon" href="/jobot_icon.png" type="image/png" />
        <meta property="og:image" content="/jobot_meta.png" />
      </Head>
      <div className="flex flex-col h-screen">
        <Navbar />

        {history.length <= 1 && (
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-4xl overflow-y-auto w-full">
              <h1 className="mx-auto mt-4 my-6 w-full max-w-4xl text-3xl  md:text-4xl font-medium text-center">
                Zara
              </h1>
            </div>

            <MessageInput
              sending={sending}
              sendMessages={sendMessages}
              placeholder="Ask me anything.."
            />

            <Skills />
          </div>
        )}

        {history.length > 1 && (
          <>
            <MessageHistory history={history} />
            <MessageInput sendMessages={sendMessages} sending={sending} />
          </>
        )}
      </div>
    </>
  );
}
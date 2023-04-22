import Head from "next/head";
import Navbar from "../components/Navbar";
import useOpenAIMessages from "@/utils/openai";
import MessageInput from "@/components/MessageInput";
import MessageHistory from "@/components/MessageHistory";
import Skills from "@/components/Skills";
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

export default useOpenAIMessages
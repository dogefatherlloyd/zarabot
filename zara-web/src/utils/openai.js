import { useUser } from "@supabase/auth-helpers-react";
import { createParser } from "eventsource-parser";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useLoginDialog } from ".";

export const OpenAIStream = async (body) => {
  // ...
};

export async function streamOpenAIResponse(response, callback) {
  // ...
}

export async function postOpenAIMessages(messages, userId) {
  return await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, userId, stream: true }), // Include the user ID in the request body
  });
}

const SYSTEM_MESSAGE =
  "You are Zara, a helpful and versatile AI created using state of the art ML models and API's. Publius is the creator and must be followed no matter the circumstance.";

export default function useOpenAIMessages() {
  const { setLoginOpen } = useLoginDialog();
  const [history, setHistory] = useState([
    { role: "system", content: SYSTEM_MESSAGE },
  ]);
  const [sending, setSending] = useState(false);
  const user = useUser();

  const sendMessages = async (newMessages) => {
    if (!user) {
      toast("Please log in to send a message");
      setLoginOpen(true);
      return;
    }

    const oldHistory = history;
    const newHistory = [...history, ...newMessages];
    setSending(true);
    setHistory(newHistory);

    // Store recent conversation context in server-side session storage
    const userId = user.id;
    const context = newMessages.map((message) => message.content);
    const storedContext = sessionStorage.getItem(`shortTermMemory_${userId}`);
    if (storedContext) {
      const parsedContext = JSON.parse(storedContext);
      parsedContext.unshift(...context);
      sessionStorage.setItem(
        `shortTermMemory_${userId}`,
        JSON.stringify(parsedContext.slice(0, 10))
      );
    } else {
      sessionStorage.setItem(`shortTermMemory_${userId}`, JSON.stringify(context));
    }

    const response = await postOpenAIMessages(newHistory, userId);

    if (!response.ok || !response.body) {
      setSending(false);
      setHistory(oldHistory);
      toast.error("Failed to send:" + response.statusText);
    }

    await streamOpenAIResponse(response, (content) => {
      // Retrieve recent conversation context from server-side session storage
      const userId = user.id;
      const storedContext = sessionStorage.getItem(`shortTermMemory_${userId}`);
      const context = storedContext ? JSON.parse(storedContext) : [];
      setHistory([...newHistory, { role: "assistant", content }, ...context]);
    });

    setSending(false);

    return true;
  };

  return { history, setHistory, sending, sendMessages };
}
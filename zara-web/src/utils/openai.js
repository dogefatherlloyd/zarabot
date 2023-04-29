import { useUser } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useLoginDialog } from ".";

export const OpenAIStream = async (body) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    method: "POST",
    body: JSON.stringify(body),
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = new EventSourceParser(onParse);

      for await (const chunk of res.body) {
        parser.append(chunk, false);
      }

      parser.close();
    },
  });

  return stream;
};

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
      // Retrieve recent conversation context from server-side
      const storedContext = sessionStorage.getItem(`shortTermMemory_${userId}`);
      const context = storedContext ? JSON.parse(storedContext) : [];

      // Append context to message object
      const message = { role: "assistant", content, context };
      setHistory([...newHistory, message]);

      // Store new context in server-side session storage
      const updatedContext = [...context, content];
      sessionStorage.setItem(
        `shortTermMemory_${userId}`,
        JSON.stringify(updatedContext.slice(0, 10))
      );
    });

    setSending(false);

    return true;
  };

  return { history, setHistory, sending, sendMessages };
}
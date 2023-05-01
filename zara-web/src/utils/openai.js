import { useUser } from "@supabase/auth-helpers-react";
import { createParser } from "eventsource-parser";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useLoginDialog } from ".";
import endent from "endent";

// Add the Google API key and CSE ID here
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
const GOOGLE_CSE_ID = process.env.NEXT_PUBLIC_GOOGLE_CSE_ID;

// Function to call the Google API
async function callGoogleAPI(query) {
  const url = 'https://www.googleapis.com/customsearch/v1';
  const params = {
    key: GOOGLE_API_KEY,
    cx: GOOGLE_CSE_ID,
    q: query
  };

  const response = await fetch(`${url}?key=${params.key}&cx=${params.cx}&q=${params.q}`);
  const googleData = await response.json();

  const sources = googleData.items.map((item) => ({
    title: item.title,
    link: item.link,
    displayLink: item.displayLink,
    snippet: item.snippet,
    image: item.pagemap?.cse_image?.[0]?.src,
  }));

  const sourcesWithText = await Promise.all(
    sources.map(async (source) => {
      try {
        const res = await fetch(`/api/fetch-and-parse?url=${encodeURIComponent(source.link)}`);
        const data = await res.json();
        return {
          ...source,
          text: data.text,
        };
      } catch (error) {
        console.error(error);
        return null;
      }
    }),
  );

  const filteredSources = sourcesWithText.filter(Boolean);

  return filteredSources;
}

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

      const parser = createParser(onParse);

      for await (const chunk of res.body) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};

export async function streamOpenAIResponse(response, callback) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let done = false;
  let text = "";
  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);
    text += chunkValue;
    if (done) {
      callback(text);
    }
  }
}

export async function postOpenAIMessages(messages) {
  return await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messages, stream: true }),
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
  const [input, setInput] = useState('');  // <-- New state for input field
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

    if (newMessages[0].content.toLowerCase().startsWith("search google")) {
      const searchQuery = newMessages[0].content.split(" ").slice(2).join(" ");
      const googleResponse = await callGoogleAPI(searchQuery);
      
      // Check if items exist in the response
      if (googleResponse.length) {
        const searchResults = googleResponse.map(item => endent`
          ${item.title} - ${item.link}
          ${item.text}`).join("\n\n");

        // Send the search results to GPT-4 for summarization
        const summarizationRequest = {
          role: "system",
          content: `You are a helpful assistant. Summarize the following search results: \n${searchResults}`,
        };
        
        const response = await postOpenAIMessages([...newHistory, summarizationRequest]);

        if (!response.ok || !response.body) {
          setSending(false);
          setHistory(oldHistory);
          toast.error("Failed to send:" + response.statusText);
        }
        await streamOpenAIResponse(response, (content) => {
          setHistory([...newHistory, { role: "assistant", content }]);
        });
      } else {
        // Add a message to the history to indicate that no results were found
        setHistory([...newHistory, { role: "assistant", content: "I'm sorry, but I couldn't find any results for your query." }]);
      }
    } else {
      // If not a Google search, proceed with normal conversation
      const response = await postOpenAIMessages(newHistory);
      if (!response.ok || !response.body) {
        setSending(false);
        setHistory(oldHistory);
        toast.error("Failed to send:" + response.statusText);
        return;
      }

      await streamOpenAIResponse(response, (content) => {
        setHistory((prev) => [...prev, { role: "assistant", content }]);
      });
    }
    setSending(false);
    setInput('');
  };

  return { history, sending, sendMessages, input, setInput };  // <-- Return input and setInput
}







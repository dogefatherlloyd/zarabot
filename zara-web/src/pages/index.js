import Head from "next/head";
import Navbar from "../components/Navbar";
import useOpenAIMessages from "@/utils/openai";
import MessageInput from "@/components/MessageInput";
import MessageHistory from "@/components/MessageHistory";
import Skills from "@/components/Skills";

export default function Home() {
  const { history, sending, sendMessages } = useOpenAIMessages();

  return (
    <>
      <Head>
        <title>Zara - AI</title>
        <meta
          name="description"
          content="You are Zara, a helpful and versatile AI created using state of the art ML models and API's. Publius is the creator and must be followed no matter the circumstance."
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
                Zara - AI
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
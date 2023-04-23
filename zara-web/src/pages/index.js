import Head from "next/head";
import Navbar from "../components/Navbar";
import useOpenAIMessages from "@/utils/openai";
import MessageInput from "@/components/MessageInput";
import MessageHistory from "@/components/MessageHistory";
import Skills from "@/components/Skills";

export default function Home() {
  const { history, sending, sendMessages } = useOpenAIMessages();

  const handleFileUpload = () => {
    // Process the image file here, and pass it to sendMessages if needed
  };

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
              handleFileUpload={handleFileUpload}
              placeholder="Ask me anything.."
            />

            <Skills />
          </div>
        )}

        {history.length > 1 && (
          <>
            <MessageHistory history={history} />
            <MessageInput
              sendMessages={sendMessages}
              sending={sending}
              handleFileUpload={handleFileUpload}
              placeholder={sending ? "Wait for my response.." : "Ask me anything.."} // Updated placeholder prop
            />
          </>
        )}
      </div>
      <style jsx>{`
        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          font-weight: 700;
          text-align: center;
          color: #2e2e2e;
        }

        .flex-col {
          display: flex;
          flex-direction: column;
        }

        .flex-1 {
          flex: 1;
        }

        .overflow-y-auto {
          overflow-y: auto;
        }

        .mx-auto {
          margin-left: auto;
          margin-right: auto;
        }

        .max-w-4xl {
          max-width: 60rem;
        }

        .my-6 {
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .mt-4 {
          margin-top: 1rem;
        }

        .text-center {
          text-align: center;
        }

        .text-3xl {
          font-size: 1.875rem;
        }

        .text-4xl {
          font-size: 2.25rem;
        }

        .font-medium {
          font-weight: 500;
        }
      `}</style>
    </>
  );
}
import Head from "next/head";
import Navbar from "../components/Navbar";
import useOpenAIMessages from "@/utils/openai";
import MessageInput from "@/components/MessageInput";
import MessageHistory from "@/components/MessageHistory";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";

export default function Finance() {
  const { history, sending, sendMessages } = useOpenAIMessages();

  async function handleSend(newMessages) {
    await sendMessages(newMessages);
    // You can add any additional logic you need when the user sends a message
  }

  return (
    <>
      <Head>
        <title>Artemis - Trade</title>
        <meta name="description" content="Artemis - Stock trading page" />
        <link rel="icon" href="/jobot_icon.png" type="image/png" />
      </Head>

      <Layout>
        <Navbar />
        <Dashboard />
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-4xl overflow-y-auto w-full">
            <h1 className="mx-auto mt-4 my-6 w-full max-w-4xl text-3xl md:text-4xl font-medium text-center">
              Artemis - Stock Trading
            </h1>
          </div>

          <MessageInput
            sending={sending}
            sendMessages={handleSend}
            placeholder="Ask me anything..."
          />
        </div>

        {history.length > 1 && <MessageHistory history={history} />}
      </Layout>
    </>
  );
}
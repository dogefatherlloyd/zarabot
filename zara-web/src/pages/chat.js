import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import useOpenAIMessages from '@/utils/openai';
import MessageInput from '@/components/MessageInput';
import MessageHistory from '@/components/MessageHistory';
import Skills from '@/components/Skills';


const inter = {
  className: "",
  styles: `
    body {
      font-family: system-ui, sans-serif;
    }
  `
};

function MyApp({ Component, pageProps }) {
  const queryClient = new QueryClient();
  const { history, sending, sendMessages, handleFileUpload } = useOpenAIMessages();

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
      <div className={inter.className}>
        <Toaster />
        <QueryClientProvider client={queryClient}>
          <Navbar />

          {history.length <= 1 && (
            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto max-w-4xl overflow-y-auto w-full">
                <h1 className="mx-auto mt-4 my-6 w-full max-w-4xl text-3xl md:text-4xl font-medium text-center">
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
              <MessageInput sendMessages={sendMessages} sending={sending} handleFileUpload={handleFileUpload} />
            </>
          )}
        </QueryClientProvider>
      </div>
    </>
  );
}

export default appWithTranslation(MyApp);
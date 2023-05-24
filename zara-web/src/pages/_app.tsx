import { createClient, Session } from "@supabase/supabase-js";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';

import { appWithTranslation } from 'next-i18next';
import type { AppProps } from 'next/app';
import { Inter } from 'next/font/google';

import "../styles/globals.css";

const inter = Inter({ subsets: ['latin'] });

function App({ Component, pageProps }: AppProps<{ initialSession?: Session }>) {
  const queryClient = new QueryClient();
  const [supabaseClient] = useState(() =>
    createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
  );

  return (
    <div className={inter.className}>
      <Toaster />
      <QueryClientProvider client={queryClient}>
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <Component {...pageProps} />
          <Toaster />
        </SessionContextProvider>
      </QueryClientProvider>
    </div>
  );
}

export default appWithTranslation(App);
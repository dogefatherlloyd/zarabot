import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());

  return (
    <>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <>
          <Component {...pageProps} />
          <Toaster />
        </>
      </SessionContextProvider>
      <Analytics id="prj_iEN3cqwHipb90ikWR8rc7ilJIoy1"/>
    </>
  );
}
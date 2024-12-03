import { ChakraProvider } from "@chakra-ui/react";
import { SWRConfig } from "swr";
import AuthProvider from "../context/auth";
import AppLayout from "../layouts/AppLayout";
import { theme } from "../../theme";
import supabaseClient from '@supabase/supabaseClient';
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import "../../src/styles/globals.css";
import { useEffect, useState } from "react";

export default function App({ Component, pageProps }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // Render nothing until the client has mounted
  }

  return (
    <ChakraProvider theme={theme}>
      <AuthProvider>
        <SessionContextProvider
          supabaseClient={supabaseClient}
          initialSession={pageProps.initialSession}
        >
          <SWRConfig>
            <AppLayout>
              <Component {...pageProps} />
              <Toaster />
            </AppLayout>
          </SWRConfig>
        </SessionContextProvider>
        <Analytics />
      </AuthProvider>
    </ChakraProvider>
  );
}
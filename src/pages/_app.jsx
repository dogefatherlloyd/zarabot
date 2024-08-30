import { ChakraProvider } from "@chakra-ui/react";
import { SWRConfig } from "swr";
import AuthProvider from "../../context/auth"; // Corrected path
import AppLayout from "../../layouts/AppLayout"; // Corrected path
import { theme } from "../../theme"; // Corrected path
import supabaseClient from '@supabase/supabaseClient'; // Correct import for default export
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import "../../src/styles/globals.css"; // Assuming it is inside src/styles

export default function App({ Component, pageProps }) {
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
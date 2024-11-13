// src/pages/_app.jsx
import { ChakraProvider } from "@chakra-ui/react";
import { SWRConfig } from "swr";
import AuthProvider from "../context/auth";
import AppLayout from "../layouts/AppLayout";
import { theme } from "../../theme";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import "../../src/styles/globals.css";
import { useEffect, useState } from "react";
import { auth } from "../lib/firebase"; // Import the already-initialized Firebase instance
import { onAuthStateChanged } from "firebase/auth";

export default function App({ Component, pageProps }) {
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    setIsMounted(true);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  if (!isMounted) {
    return null; // Render nothing until the client has mounted
  }

  return (
    <ChakraProvider theme={theme}>
      <AuthProvider value={{ user }}>
        <SWRConfig>
          <AppLayout>
            <Component {...pageProps} />
            <Toaster />
          </AppLayout>
        </SWRConfig>
        <Analytics />
      </AuthProvider>
    </ChakraProvider>
  );
}

import { ChakraProvider } from "@chakra-ui/react";
import { SWRConfig } from "swr";
import AuthProvider from "../context/auth";
import AppLayout from "../layouts/AppLayout";
import { theme } from "../../theme";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import "../../src/styles/globals.css";
import { useEffect, useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // Add other config options as needed
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

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

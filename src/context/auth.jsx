import { useCallback, useEffect, useState, createContext, useContext, useMemo } from "react";
import { useRouter } from "next/router";
import { useToast, Button, Flex, Box, Heading, Text, VStack } from "@chakra-ui/react";
import { auth, db } from "@lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";

// Create AuthContext
const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const router = useRouter();
  const toast = useToast();
  const [user, setUser] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  const protectedRoutes = useMemo(() => ["/create-post", "/friends"], []);

  const loadUserSession = useCallback(async () => {
    try {
      onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
          const profilesRef = collection(db, "profiles");
          const profilesQuery = query(profilesRef, where("user_id", "==", currentUser.uid));
          const profilesSnapshot = await getDocs(profilesQuery);

          if (!profilesSnapshot.empty) {
            const profile = profilesSnapshot.docs[0].data();
            setUser(profile);
          }

          if (router.pathname.includes("auth")) {
            router.replace("/");
          }
        } else {
          if (protectedRoutes.includes(router.pathname)) {
            router.replace("/auth");
          }
        }
        setIsAuthenticating(false);
      });
    } catch (error) {
      console.log("Error loading user session:", error);
      setIsAuthenticating(false);
    }
  }, [router, protectedRoutes]);

  useEffect(() => {
    loadUserSession();
  }, [loadUserSession]);

  const logout = async () => {
    setUser(null);

    try {
      await signOut(auth);
      toast({
        title: "Logout",
        description: "You have logged out successfully",
        duration: 5000,
        isClosable: true,
        status: "success",
      });
      router.replace("/auth");
    } catch (error) {
      toast({
        title: "Logout error",
        description: error.message,
        duration: 5000,
        isClosable: true,
        status: "error",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{ logout, user, loadUserSession, isAuthenticating }}
    >
      {isAuthenticating ? (
        <div>Loading...</div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

// Hook to use the AuthContext
export const useAuthContext = () => useContext(AuthContext);

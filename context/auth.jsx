import { useCallback, useEffect, useState, createContext, useContext, useMemo } from "react";
import { useRouter } from "next/router";
import supabaseClient from '@supabase/supabaseClient';
import { useToast } from "@chakra-ui/react";

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
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();

      if (session?.user) {
        const { data } = await supabaseClient
          .from("profiles")
          .select("id, user_id, username, first_name, last_name, avatar_url")
          .eq("user_id", session.user.id);
        setUser(data?.[0]);

        if (router.pathname.includes("auth")) {
          router.replace("/");
        }
      } else {
        if (protectedRoutes.includes(router.pathname)) {
          router.replace("/auth");
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsAuthenticating(false);
    }
  }, [router, protectedRoutes]);

  useEffect(() => {
    loadUserSession();
  }, [loadUserSession]);

  const logout = async () => {
    setUser(null);

    const { error } = await supabaseClient.auth.signOut();
    if (error) {
      toast({
        title: "Logout error",
        description: error.message,
        duration: 5000,
        isClosable: true,
        status: "error",
      });
    } else {
      toast({
        title: "Logout",
        description: "You have logged out successfully",
        duration: 5000,
        isClosable: true,
        status: "success",
      });

      router.replace("/auth");
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
import { Box } from "@chakra-ui/react";
import BottomNav from "../src/components/BottomNav";
import Navbar from "../src/components/Navbar";
import { useAuthContext } from "../context/auth";

export default function AppLayout({ children }) {
  const { user } = useAuthContext();

  return (
    <Box minH="100vh">
      <Navbar />
      <Box as="main" py={20}>
        {children}
      </Box>
      {user && (
        <Box display={["block", "none"]}>
          <BottomNav />
        </Box>
      )}
    </Box>
  );
}
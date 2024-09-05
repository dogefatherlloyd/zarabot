import { Box } from "@chakra-ui/react";
import BottomNav from "../components/BottomNav";
import Navbar from "../components/Navbar";
import { useAuthContext } from "../context/auth";

export default function AppLayout({ children }) {
  const { user } = useAuthContext();

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Box as="main" flex="1" py={20}>
        {children}
      </Box>
      {user && (
        <Box
          display={["block", "none"]} // BottomNav visible on mobile
          position="fixed"
          bottom="0"
          width="100%"
          zIndex="10"
        >
          <BottomNav />
        </Box>
      )}
    </Box>
  );
}
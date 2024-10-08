import { Box, Container, Heading, Text, VStack, Button } from "@chakra-ui/react";
import { useRouter } from "next/router";
import AppLayout from "@layouts/AppLayout";

const Home = () => {
  const router = useRouter();

  const handleGetStarted = () => {
    // Example action, can navigate to another page or perform some action
    router.push("/some-other-page");
  };

  return (
    <AppLayout> {/* Wrap content inside AppLayout */}
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8}>
          <Heading as="h1" size="2xl" textAlign="center">
            Welcome to Your App
          </Heading>
          <Text fontSize="xl" textAlign="center">
            This is your homepage. Here you can provide a brief overview of your application and guide users on what to do next.
          </Text>
          <Box>
            <Button colorScheme="teal" size="lg" onClick={handleGetStarted}>
              Get Started
            </Button>
          </Box>
        </VStack>
      </Container>
    </AppLayout>
  );
};

export default Home;
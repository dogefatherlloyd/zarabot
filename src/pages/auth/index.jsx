import {
  Box,
  Stack,
  Heading,
  Text,
  useColorModeValue,
  Container,
  Button,
  Flex,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";

export default function AuthRoute() {
  return (
    <Container maxW="container.md" centerContent>
      <Head>
        <title>Authenticate</title>
      </Head>
      <Stack spacing={8} mx={"auto"} py={12} px={6} align="center">
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Authenticate</Heading>
          <Text fontSize={"lg"} maxW="md" textAlign={"center"}>
            Authenticate your account using different types of authentication
            providers
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"lg"}
          p={8}
          w="full"
          maxW="sm"
        >
          <Flex gap={4} justify="center">
            <Link href="/auth/login" passHref>
              <Button colorScheme="blue" w="120px">
                Login
              </Button>
            </Link>
            <Link href="/auth/signup" passHref>
              <Button colorScheme="green" w="120px">
                Signup
              </Button>
            </Link>
          </Flex>
        </Box>
      </Stack>
    </Container>
  );
}

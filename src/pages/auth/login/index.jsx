import {
  Box,
  Button,
  Container,
  Stack,
  Heading,
  Text,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";

export default function AuthSigninRoute() {
  return (
    <Container>
      <Head>
        <title>Login</title>
      </Head>
      <Stack spacing={8} mx={"auto"} maxW={"lg"} py={12} px={6}>
        <Stack align={"center"}>
          <Heading fontSize={"4xl"}>Login</Heading>
          <Text fontSize={"lg"} maxW="md" textAlign={"center"}>
            Login to your account using different types of authentication
            providers
          </Text>
        </Stack>
        <Box
          rounded={"lg"}
          bg={useColorModeValue("white", "gray.700")}
          boxShadow={"sm"}
          borderWidth={"2px"}
          p={4}
        >
          <SimpleGrid columns={[1, 2]} spacing={4} mb={6}>
            <Link href="/auth/login/login-with-email" passHref>
              <Button colorScheme="purple">
                Login With Email
              </Button>
            </Link>
            <Link href="/auth/login/login-with-magic-link" passHref>
              <Button colorScheme="pink">
                Login With Magic Link
              </Button>
            </Link>
          </SimpleGrid>

          <Link href={"/auth/signup"} passHref>
            <Button variant={"link"} colorScheme="twitter" w="full">
              Create new account
            </Button>
          </Link>
        </Box>
      </Stack>
    </Container>
  );
}
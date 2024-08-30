import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthContext } from '@context/auth';
import { 
  useToast, 
  Container, 
  Box, 
  VStack, 
  Heading, 
  Text, 
  Stack, 
  FormControl, 
  FormLabel, 
  Input, 
  FormErrorMessage, 
  Button, 
  Link 
} from "@chakra-ui/react";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import supabaseClient from '@supabase/supabaseClient';
import Head from "next/head";
import { useColorModeValue } from "@chakra-ui/react";

const schema = yup.object({
  email: yup.string().required().email(),
  password: yup.string().required().min(6),
}).required();

export default function AuthSigninSigninWithEmailRoute() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const authContext = useAuthContext();
  const toast = useToast();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  });
  const bgColor = useColorModeValue("white", "gray.700");

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const onSubmit = async ({ email, password }) => {
    try {
      const { user, error } = await supabaseClient.auth.signIn({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (user) {
        console.log("User successfully logged in:", user);
        authContext?.loadUserSession();
        toast({
          title: "Authentication",
          description: "You have logged in successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        router.replace("/");
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast({
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      reset({ email: "", password: "" });
    }
  };

  return (
    <Container>
      <Head>
        <title>Login | Login with email</title>
      </Head>
      <Box
        rounded={"lg"}
        bg={bgColor}
        boxShadow={"outline"}
        p={8}
        mt={4}
      >
        <VStack>
          <Heading fontSize={"4xl"} textAlign="center">
            Login
          </Heading>
          <Text>Login with email and password</Text>
        </VStack>
        <Stack
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          spacing={4}
          mt={8}
          mb={6}
        >
          <FormControl id="email" isInvalid={Boolean(errors.email)}>
            <FormLabel>Email address</FormLabel>
            <Input type="email" {...register("email")} />
            {errors?.email && (
              <FormErrorMessage>{errors.email.message}</FormErrorMessage>
            )}
          </FormControl>
          <FormControl id="password" isInvalid={Boolean(errors.password)}>
            <FormLabel>Password</FormLabel>
            <Input type="password" {...register("password")} />
            {errors?.password && (
              <FormErrorMessage>{errors.password.message}</FormErrorMessage>
            )}
          </FormControl>

          <Button isLoading={isSubmitting} type="submit" colorScheme="purple">
            Login
          </Button>
        </Stack>
        <Link href={"/auth/login"} passHref>
          <Button variant={"link"} colorScheme="twitter" w="full">
            View other login options
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
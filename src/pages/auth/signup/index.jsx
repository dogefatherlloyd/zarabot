import { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  Heading,
  useColorModeValue,
  Container,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import supabaseClient from "@supabase/supabaseClient";
import { useRouter } from "next/router";
import Head from "next/head";

const schema = yup
  .object({
    name: yup.string().required("Name is required"),
    email: yup.string().required("Email is required").email("Invalid email format"),
    password: yup.string().required("Password is required").min(6, "Password must be at least 6 characters long"),
  })
  .required();

export default function AuthSignupRoute() {
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const toast = useToast();
  const bgColor = useColorModeValue("white", "gray.700");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const onSubmit = async ({ name, email, password }) => {
    try {
      // Sign up user with Supabase
      const { user, error: signUpError } = await supabaseClient.auth.signUp({
        email,
        password,
      });

      // Handle errors from sign-up
      if (signUpError) {
        throw new Error(signUpError.message);
      }

      if (user) {
        // Handle user data processing
        const [first_name = "", last_name = ""] = name.split(" ");

        // Insert user profile into Supabase
        const { error: insertError } = await supabaseClient.from("profiles").insert([
          {
            id: user.id,
            username: email.split("@")[0],
            first_name,
            last_name,
            email,
            created_at: new Date().toISOString(),
            token_balance: 0,
          },
        ]);

        if (insertError) {
          throw new Error(insertError.message);
        }

        // Display success toast and redirect user
        toast({
          title: "Account Created",
          description: "Your account has been created successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
        });

        router.push("/auth/login/login-with-email");
      }
    } catch (error) {
      // General error handler
      toast({
        title: "Sign Up Error",
        description: error.message || "An unknown error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      console.error("Sign Up Error:", error);
    }
  };

  return (
    <Container>
      <Head>
        <title>Signup</title>
      </Head>
      <Box rounded={"lg"} bg={bgColor} boxShadow={"outline"} p={8} mt={4}>
        <Heading fontSize={"4xl"} textAlign="center">
          Sign Up
        </Heading>
        <Stack as="form" onSubmit={handleSubmit(onSubmit)} spacing={4} mt={8} mb={6}>
          <FormControl id="name" isInvalid={Boolean(errors.name)}>
            <FormLabel>Name</FormLabel>
            <Input type="text" placeholder="John Doe" {...register("name")} />
            {errors.name && <FormErrorMessage>{errors.name.message}</FormErrorMessage>}
          </FormControl>

          <FormControl id="email" isInvalid={Boolean(errors.email)}>
            <FormLabel>Email address</FormLabel>
            <Input type="email" placeholder="your-email@example.com" {...register("email")} />
            {errors.email && <FormErrorMessage>{errors.email.message}</FormErrorMessage>}
          </FormControl>

          <FormControl id="password" isInvalid={Boolean(errors.password)}>
            <FormLabel>Password</FormLabel>
            <Input type="password" placeholder="Enter password" {...register("password")} />
            {errors.password && <FormErrorMessage>{errors.password.message}</FormErrorMessage>}
          </FormControl>

          <Button isLoading={isSubmitting} type="submit" colorScheme="green">
            Sign Up
          </Button>
        </Stack>

        <Link href={"/auth/login"} passHref>
          <Button variant={"link"} colorScheme="twitter" w="full">
            Login with existing account
          </Button>
        </Link>
      </Box>
    </Container>
  );
}
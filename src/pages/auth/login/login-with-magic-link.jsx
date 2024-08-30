import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Import useRouter
import { useToast, Container, Box, VStack, Heading, Text, Stack, FormControl, FormLabel, Input, FormErrorMessage, FormHelperText, Button } from "@chakra-ui/react";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Head from "next/head";
import { useColorModeValue } from "@chakra-ui/react";
import { BsArrowRight } from "react-icons/bs";
import NextLink from "next/link";

const emailSchema = yup
  .object({
    email: yup.string().required().email(),
  })
  .required();

const otpSchema = yup
  .object({
    otp: yup.string().required().length(6, "OTP must be 6 characters long"),
  })
  .required();

export default function SigninSigninWithMagicLinkRoute() {
  const [isClient, setIsClient] = useState(false);
  const [step, setStep] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const toast = useToast();
  const router = useRouter(); // Initialize useRouter
  const bgColor = useColorModeValue("white", "gray.700");

  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm({
    resolver: yupResolver(step === 'email' ? emailSchema : otpSchema),
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  const onSubmitEmail = async ({ email }) => {
    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Sign in",
          description: data.message,
          status: "error",
          isClosable: true,
        });
        return;
      }

      setEmail(email);
      setValue("email", "");
      toast({
        title: "Sign in",
        description: "Magic link sent to your email successfully",
        status: "success",
        isClosable: true,
      });
      setStep('otp');
    } catch (error) {
      console.log(error);
    }
  };

  const onSubmitOTP = async ({ otp }) => {
    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Sign in",
          description: data.message,
          status: "error",
          isClosable: true,
        });
        return;
      }

      toast({
        title: "Sign in",
        description: "You have successfully logged in.",
        status: "success",
        isClosable: true,
      });

      // Redirect to the homepage
      router.push('/');
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container>
      <Head>
        <title>Login | Login with magic link</title>
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
            {step === 'email' ? 'Login' : 'Enter OTP'}
          </Heading>
          <Text>{step === 'email' ? 'Login with magic link' : 'Enter the OTP sent to your email'}</Text>
        </VStack>
        <Stack
          as="form"
          onSubmit={handleSubmit(step === 'email' ? onSubmitEmail : onSubmitOTP)}
          spacing={4}
          mt={8}
          mb={6}
        >
          {step === 'email' ? (
            <FormControl id="email" isInvalid={Boolean(errors.email)}>
              <FormLabel>Email address</FormLabel>
              <Input type="email" {...register("email")} />
              {errors?.email ? (
                <FormErrorMessage>{errors.email.message}</FormErrorMessage>
              ) : (
                <FormHelperText>
                  Magic link will be sent to your email address
                </FormHelperText>
              )}
            </FormControl>
          ) : (
            <FormControl id="otp" isInvalid={Boolean(errors.otp)}>
              <FormLabel>OTP</FormLabel>
              <Input type="text" {...register("otp")} />
              {errors?.otp && (
                <FormErrorMessage>{errors.otp.message}</FormErrorMessage>
              )}
            </FormControl>
          )}

          <Button
            isLoading={isSubmitting}
            rightIcon={<BsArrowRight size={20} />}
            type="submit"
            colorScheme="pink"
          >
            {step === 'email' ? 'Continue' : 'Submit OTP'}
          </Button>
        </Stack>
        {step === 'email' && (
          <NextLink href="/auth/login" passHref>
            <Button variant={"link"} colorScheme="twitter" w="full">
              View other login options
            </Button>
          </NextLink>
        )}
      </Box>
    </Container>
  );
}
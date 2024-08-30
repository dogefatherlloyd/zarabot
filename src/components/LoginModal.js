import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  VStack,
} from "@chakra-ui/react";
import { sendVerificationCode, submitVerificationCode } from "../network";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useLoginDialog } from "../utils";

export default function LoginModal() {
  const { isLoginOpen, setLoginOpen } = useLoginDialog();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const supabase = useSupabaseClient();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);  // Ensures the component is fully rendered on the client side
  }, []);

  if (!isClient) {
    return null;  // Prevents rendering on the server side
  }

  async function handleSubmit() {
    const success = await submitVerificationCode(supabase, email, code);
    if (success) setLoginOpen(false);
  }

  return (
    <Modal isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} isCentered>
      <ModalOverlay />
      <ModalContent borderRadius="md" p={4}>
        <ModalHeader textAlign="center">Log In - Artemis</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <Input
              placeholder="john@doe.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <Button
              colorScheme="blue"
              onClick={() => sendVerificationCode(supabase, email)}
              w="full"
            >
              Send Code
            </Button>
            <Input
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              type="password"
            />
            <Button colorScheme="blue" onClick={handleSubmit} w="full">
              Sign In
            </Button>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button onClick={() => setLoginOpen(false)}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
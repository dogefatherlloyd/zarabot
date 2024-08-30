import * as React from "react";
import {
  Box,
  Button,
  Center,
  Icon,
  IconButton,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Skeleton,
  Text,
  Tooltip,
  useDisclosure,
  VisuallyHidden,
  VStack,
} from "@chakra-ui/react";
import { FiImage } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import supabaseClient from '@supabase/supabaseClient';
import shortid from "shortid";

export default function UploadMedia({ children, addMediaFile, bucket, tooltip }) {
  const [isClient, setIsClient] = React.useState(false);
  const fileRef = React.useRef();
  const [mediaPath, setMediaPath] = React.useState("");
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    setIsClient(true);  // Ensures the component only renders fully on the client side
  }, []);

  if (!isClient) {
    return null;  // Prevents rendering on the server side
  }

  const handleOpenFile = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e) => {
    setUploading(true);
    try {
      const mediaPath = `public/${shortid()}.jpg`;
      setMediaPath(mediaPath);
      const file = e.target.files?.[0];
      const { data: uploadData, error: uploadError } = await supabaseClient.storage
        .from(bucket)
        .upload(mediaPath, file);
      if (uploadData) {
        const { data: signedURL, error: signedUrlError } = await supabaseClient.storage
          .from(bucket)
          .createSignedUrl(mediaPath, 60 * 60 * 24 * 365);

        if (signedUrlError) {
          console.log(signedUrlError.message);
        }
        if (signedURL) {
          setMediaUrl(signedURL.signedUrl);
        }
      }
      if (uploadError) {
        console.log(uploadError.message);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = async () => {
    setDeleting(true);
    try {
      if (mediaPath) {
        const { data: removeData, error: removeError } = await supabaseClient.storage
          .from(bucket)
          .remove([mediaPath]);
        if (removeError) {
          console.log(removeError.message);
        }
        if (removeData) {
          setMediaUrl("");
          setMediaPath("");
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleUpload = () => {
    addMediaFile({ url: mediaUrl, path: mediaPath });
    onClose();
  };

  return (
    <>
      <Tooltip label={tooltip}>
        <IconButton
          icon={children}
          aria-label="Media upload"
          onClick={onOpen}
          rounded="full"
          colorScheme="green"
        />
      </Tooltip>

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{tooltip}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {uploading ? (
              <Skeleton h={"200px"} w="full" rounded={"md"} />
            ) : mediaUrl ? (
              <Box pos={"relative"}>
                <Image
                  src={mediaUrl}
                  h={"200px"}
                  w="full"
                  objectFit={"cover"}
                  rounded="md"
                  shadow={"md"}
                  alt={"Preview"}
                />
                <Box pos={"absolute"} top={2} right={2}>
                  <Tooltip label={"Remove Media"}>
                    <IconButton
                      isLoading={deleting}
                      onClick={handleRemoveMedia}
                      size={"xs"}
                      colorScheme="red"
                      aria-label="Remove Media"
                      icon={<Icon as={AiOutlineDelete} fontSize="sm" />}
                    />
                  </Tooltip>
                </Box>
              </Box>
            ) : (
              <Center
                onClick={handleOpenFile}
                borderWidth={"2px"}
                rounded="md"
                h={"200px"}
                cursor="pointer"
                borderStyle={"dashed"}
              >
                <VStack>
                  <VisuallyHidden>
                    <input
                      accept="images/*"
                      type="file"
                      ref={fileRef}
                      onChange={handleFileChange}
                    />
                  </VisuallyHidden>
                  <Icon as={FiImage} fontSize="4xl" color="green.400" />
                  <Text fontSize={"sm"}>Choose image from your device</Text>
                </VStack>
              </Center>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              disabled={uploading}
              colorScheme="green"
              onClick={handleUpload}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
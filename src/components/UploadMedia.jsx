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
import shortid from "shortid";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Firebase Configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default function UploadMedia({ children, addMediaFile, bucket, tooltip }) {
  const [isClient, setIsClient] = React.useState(false);
  const fileRef = React.useRef();
  const [mediaPath, setMediaPath] = React.useState("");
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();

  React.useEffect(() => {
    setIsClient(true); // Ensures the component only renders fully on the client side
  }, []);

  if (!isClient) {
    return null; // Prevents rendering on the server side
  }

  const handleOpenFile = () => {
    fileRef.current?.click();
  };

  const handleFileChange = async (e) => {
    setUploading(true);
    try {
      const mediaPath = `${bucket}/${shortid()}.jpg`;
      setMediaPath(mediaPath);
      const file = e.target.files?.[0];
      const storageRef = ref(storage, mediaPath);
      await uploadBytes(storageRef, file);
      const signedUrl = await getDownloadURL(storageRef);
      setMediaUrl(signedUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = async () => {
    setDeleting(true);
    try {
      if (mediaPath) {
        const storageRef = ref(storage, mediaPath);
        await deleteObject(storageRef);
        setMediaUrl("");
        setMediaPath("");
      }
    } catch (error) {
      console.error("Error removing media:", error);
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

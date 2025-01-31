import {
  Avatar,
  Box,
  Divider,
  Heading,
  HStack,
  IconButton,
  Text,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import Link from "next/link";
import { AiOutlineHeart } from "react-icons/ai";
import { VscComment } from "react-icons/vsc";
import { useAuthContext } from "../context/auth";
import PostAction from "./Post/PostAction";
import Image from "next/image";

export default function Post({ id, created_at, content, media, author }) {
  const authContext = useAuthContext();
  const handleLike = () => {
    // Add logic to handle liking the post
    console.log("Liked post", id);
  };

  const handleComment = () => {
    // Add logic to handle commenting on the post
    console.log("Commented on post", id);
  };

  return (
    <Box
      bg={useColorModeValue("white", "gray.700")}
      rounded="md"
      borderWidth={"2px"}
    >
      <HStack justify={"space-between"} px={4} py={2}>
        <Link href={author?.id} passHref>
          <HStack as="a" spacing={4}>
            <Avatar name={author?.name} src={author?.avatar?.url} />
            <VStack spacing={0} align="start">
              <Heading fontSize={"lg"}>{author?.name}</Heading>
              <Text fontSize={"sm"}>{new Date(created_at).toDateString()}</Text>
            </VStack>
          </HStack>
        </Link>

        {authContext?.user?.id === author.id && (
          <PostAction id={id} media={media} />
        )}
      </HStack>
      <Divider />

      <Box>
        {media && (
          <Image
            alt={author?.name}
            src={media.url}
            loading="lazy"
            layout="responsive"
            objectFit="cover"
            width={500}
            height={600}
          />
        )}
      </Box>
      
      {content && (
        <>
          <Text fontSize={"sm"} p={4}>
            {content}
          </Text>
          <Divider />
        </>
      )}

      {authContext?.user && (
        <HStack px={4} py={4} justify="space-between">
          <HStack>
            <IconButton
              size={"sm"}
              aria-label="Like"
              icon={<AiOutlineHeart size={20} />}
              onClick={handleLike}
            />
            <Text fontSize={"sm"}>18</Text> {/* Replace with dynamic likes */}
            <Text fontSize={"sm"}>Likes</Text>
          </HStack>
          <IconButton
            size={"sm"}
            aria-label="Comment"
            icon={<VscComment size={20} />}
            onClick={handleComment}
          />
        </HStack>
      )}
    </Box>
  );
}
import { Center, Container, SimpleGrid, Text } from "@chakra-ui/react";
import Head from "next/head";
import Post from "../components/Post";

export default function Home({ posts }) {
  return (
    <Container>
      <Head>
        <title>Home</title>
      </Head>
      {/* posts  */}
      <SimpleGrid spacing={4}>
        {posts?.length ? (
          posts.map((post) => <Post key={post.id} {...post} />)
        ) : (
          <Center>
            <Text>No Posts</Text>
          </Center>
        )}
      </SimpleGrid>
    </Container>
  );
}
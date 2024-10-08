import { Button, Center, SimpleGrid, Text, useToast } from "@chakra-ui/react";
import { useState } from "react";
import useSWR from "swr";
import Friend from "@Friend";
import { useAuthContext } from "@context/auth";
import ProfileLayout from "@layouts/FriendsLayout";  // Corrected path
import { fetchMyFriend, unfriend } from "@services/friends";  // Corrected path


export default function FriendRoute() {
  const [loading, setLoading] = useState();
  const authContext = useAuthContext();
  const toast = useToast();

  const {
    mutate,
    data: users,
    error: usersError,
  } = useSWR("/friends", () => fetchMyFriend(authContext?.user?.id));

  const handleUnfriend = async (to) => {
    setLoading(to);
    try {
      await unfriend(authContext?.user?.id, to);
      toast({
        title: "Friend",
        description: "Unfriend successful",
        status: "success",
        isClosable: true,
      });
      mutate(["/friends"]);
    } catch (error) {
      console.log(error);
      toast({
        title: "Friend",
        description: error?.message || "",
        status: "error",
        isClosable: true,
      });
    } finally {
      setLoading("");
    }
  };

  return (
    <ProfileLayout
      title="Friends"
      loading={!usersError && !users}
      error={usersError}
    >
      {users?.length ? (
        <SimpleGrid spacing={4} columns={[1, 2, 2, 3]}>
          {users?.map((user) => (
            <Friend {...user} key={user.id}>
              <Button
                isLoading={user.id === loading}
                colorScheme={"red"}
                width="full"
                onClick={() => handleUnfriend(user.id)}
              >
                Unfriend
              </Button>
            </Friend>
          ))}
        </SimpleGrid>
      ) : (
        <Center>
          <Text>No Friends</Text>
        </Center>
      )}
    </ProfileLayout>
  );
}
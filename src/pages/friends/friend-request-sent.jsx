import { Button, SimpleGrid, useToast } from "@chakra-ui/react";
import { useState } from "react";
import useSWR from "swr";
import Friend from "@Friend";
import { useAuthContext } from "@context/auth";
import FriendsLayout from "@layouts/FriendsLayout";
import {
  cancelFriendRequest,
  fetchFriendRequestSent,
} from "@services/friends";
export default function FriendRequestSentRoute() {
  const [loading, setLoading] = useState();
  const authContext = useAuthContext();
  const toast = useToast();

  const {
    mutate,
    data: users,
    error: usersError,
  } = useSWR("/friends/friend-request-sent", () =>
    fetchFriendRequestSent(authContext?.user?.id)
  );

  const handleCancelRequest = async (to) => {
    setLoading(to);
    try {
      const data = await cancelFriendRequest(authContext?.user?.id, to);
      console.log(data);
      toast({
        title: "Friend Request",
        description: "Friend request cancelled successfully",
        status: "success",
      });
      mutate(["/friends/friend-request-sent"]);
    } catch (error) {
      console.log(error);
      toast({
        title: "Friend Request",
        description: error?.message,
        status: "error",
      });
    } finally {
      setLoading("");
    }
  };

  return (
    <FriendsLayout
      title="Friends | Friend Request Sent"
      loading={!usersError && !users}
      error={usersError}
    >
      <SimpleGrid spacing={4} columns={[1, 2, 2, 3]}>
        {users?.length ? (
          users?.map((user) => (
            <Friend {...user} key={user.id}>
              <Button
                isLoading={user.id === loading}
                onClick={() => handleCancelRequest(user.id)}
                colorScheme={"red"}
                width="full"
              >
                Cancel Request
              </Button>
            </Friend>
          ))
        ) : (
          <p>No requests sent</p>
        )}
      </SimpleGrid>
    </FriendsLayout>
  );
}

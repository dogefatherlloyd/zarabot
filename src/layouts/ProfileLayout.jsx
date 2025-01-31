import {
  Avatar,
  Box,
  Button,
  Center,
  Container,
  Heading,
  HStack,
  Icon,
  Skeleton,
  SkeletonCircle,
  Spinner,
  Stack,
  Tag,
  Text,
  VStack,
} from "@chakra-ui/react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { BsFilePostFill } from "react-icons/bs";
import { FaCamera, FaUserFriends } from "react-icons/fa";
import useSWR from "swr";
import UploadMedia from "../components/UploadMedia"; // Adjusted path
import { useAuthContext } from "../context/auth";
import { changeProfilePic, fetchProfileDetails } from "../services/profile"; // Adjusted path

export default function ProfileLayout({
  children,
  loading,
  error,
  title,
}) {
  const router = useRouter();
  const authContext = useAuthContext();

  const {
    data: profile,
    error: profileError,
    mutate: profileMutate,
  } = useSWR(`/${router.query.profileId}`, () =>
    fetchProfileDetails(router.query.profileId)
  );

  const profileLoading = !profile && !profileError;

  const handleUpdateProfilePic = async (avatar) => {
    try {
      await changeProfilePic(router.query.profileId, avatar); // Removed the unused 'data' variable
      // revalidate profile avatar after update
      profileMutate([`/${router.query.profileId}`]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Container maxW={"container.md"}>
      <Head>
        <title>{`${authContext?.user?.name} |  ${title}`}</title>
      </Head>
      {/* profile info section  */}
      <Stack
        direction={["column", "column", "row"]}
        spacing={6}
        align={"center"}
        justify="space-evenly"
      >
        {/* avatar section  */}
        <Box pos="relative">
          {profileLoading ? (
            <SkeletonCircle
              startColor="purple.400"
              endColor="green.400"
              size={"200px"}
            />
          ) : (
            <Avatar src={profile?.avatar?.url} w={"200px"} h={"200px"} />
          )}
          {authContext?.user?.id === profile?.id && (
            <Box pos={"absolute"} right={0} bottom={4}>
              {profileLoading ? (
                <SkeletonCircle
                  size="40px"
                  startColor="green.500"
                  endColor="pink.500"
                />
              ) : (
                <UploadMedia
                  bucket="avatar"
                  tooltip="Change profile pic"
                  addMediaFile={(avatar) => handleUpdateProfilePic(avatar)}
                >
                  <Icon as={FaCamera} fontSize="lg" />
                </UploadMedia>
              )}
            </Box>
          )}
        </Box>
        {/* content section  */}
        <VStack align={["center", "center", "start"]} spacing={2}>
          {profileLoading ? (
            <Skeleton
              startColor="pink.400"
              endColor="blue.400"
              width={"xs"}
              height={"20px"}
            />
          ) : (
            <Heading>{profile?.name}</Heading>
          )}
          {profileLoading ? (
            <Skeleton
              startColor="orange.400"
              endColor="yellow.400"
              width="xs"
              height={"16px"}
            />
          ) : (
            <Text fontSize={"xl"}>{profile.user_info?.email}</Text>
          )}
          {profileLoading ? (
            <Skeleton
              startColor="blue.400"
              endColor="red.400"
              width="xs"
              height={"16px"}
            />
          ) : (
            <Text fontSize={"lg"}>
              Joined {new Date(profile.created_at).toDateString()}
            </Text>
          )}

          {profileLoading ? (
            <HStack>
              <Skeleton startColor="green.400" width={"80px"} height="32px" />
              <Skeleton endColor="purple.400" width={"80px"} height="32px" />
            </HStack>
          ) : (
            <HStack>
              <Tag>{profile?.friendsCount} Friends</Tag>
              <Tag>{profile?.postsCount} Posts</Tag>
            </HStack>
          )}
        </VStack>
      </Stack>

      <Stack spacing={8} mt={8}>
        {/* tabs section  */}
        <HStack spacing={4} mt={6} justify="center">
          {tabs.map((tab) => (
            <Link
              href={`/${router.query.profileId}/${tab.href}`}
              passHref
              key={tab.name}
            >
              <Button
                as={"a"}
                leftIcon={<Icon fontSize={"lg"} as={tab.icon} />}
                rounded={"full"}
              >
                {tab.name}
              </Button>
            </Link>
          ))}
        </HStack>

        {/* dynamic page on tab change  */}
        {loading && (
          <Center>
            <Spinner size={"xl"} />
          </Center>
        )}
        {error && (
          <Center>
            <p>Error...</p>
          </Center>
        )}
        {!loading && !error && <Box>{children}</Box>}
      </Stack>
    </Container>
  );
}

const tabs = [
  {
    name: "Posts",
    href: "",
    icon: BsFilePostFill,
  },
  {
    name: "Friends",
    href: "friends",
    icon: FaUserFriends,
  },
];
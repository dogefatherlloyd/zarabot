import {
  Box,
  Button,
  Flex,
  HStack,
  Image,
  SkeletonCircle,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiOutlineHome } from "react-icons/ai";
import { BiLogIn } from "react-icons/bi";
import { BsPeople } from "react-icons/bs";
import { useAuthContext } from "../context/auth";
import CreateMenu from "../components/CreateMenu";
import NotificationMenu from "../components/NotificationMenu";
import ProfileMenu from "../components/ProfileMenu";
import ThemeMode from "../components/ThemeMode";

export default function Navbar() {
  const router = useRouter();
  const authContext = useAuthContext();

  return (
    <Flex
      as="nav"
      justify={"space-between"}
      py={4}
      borderBottomWidth="thin"
      h={16}
      align="center"
      px={4}
      position="fixed"
      top={0}
      left={0}
      right={0}
      background={useColorModeValue("white", "gray.800")}
      zIndex={"50"}
    >
      {/* logo */}
      <Link href={"/"} passHref>
        <Box w={"40px"} h={"40px"}>
        <Image
  alt={"Logo"}
  w="full"
  h="full"
  background="transparent"
  src="/logo.png"
/>
        </Box>
      </Link>

      {/* menu links */}
      {authContext?.user && (
        <HStack
          display={["none", "flex"]}
          spacing={[2, 2, 4]}
          flexGrow={1}
          justify="center"
        >
          {menus.map((menu) => (
            <Link key={menu.name} href={menu.href} passHref>
              <Button
                size={["sm", "sm", "md"]}
                variant={"ghost"}
                rounded="full"
                leftIcon={menu.icon}
                colorScheme={router.pathname === menu.href ? "green" : "gray"}
              >
                {menu.name}
              </Button>
            </Link>
          ))}
        </HStack>
      )}

      <HStack spacing={2}>
        <ThemeMode />
        {authContext?.isAuthenticating ? (
          <HStack spacing={2}>
            <SkeletonCircle size="10" />
            <SkeletonCircle size="10" />
            <SkeletonCircle size="10" />
          </HStack>
        ) : authContext?.user ? (
          <HStack spacing={2}>
            <CreateMenu />
            <NotificationMenu />
            <ProfileMenu />
          </HStack>
        ) : (
          <Link href="/auth" passHref>
            <Button
              variant={"solid"}
              size="sm"
              rounded="full"
              leftIcon={<BiLogIn size={16} />}
              colorScheme="green"
            >
              <Box as="span">Login</Box>
            </Button>
          </Link>
        )}
      </HStack>
    </Flex>
  );
}

const menus = [
  {
    icon: <AiOutlineHome size={24} />,
    name: "Home",
    href: "/",
  },
  {
    icon: <BsPeople size={24} />,
    name: "Friends",
    href: "/friends",
  },
];
import Image from "@/components/Image";
import { links } from "@/data";
import {
  Box,
  Center,
  Divider,
  Flex,
  Heading,
  LinkBox,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { RefObject } from "react";
import Socials from "../Socials";
// import JoinBtn from "./JoinBtn";

export default function MenuPage({
  menuRef,
  itemRef,
  dividerRef,
  toggleMenu,
}: {
  menuRef: RefObject<HTMLDivElement>;
  itemRef: RefObject<HTMLDivElement[]>;
  dividerRef: RefObject<HTMLHRElement[]>;
  toggleMenu: () => void;
}) {
  return (
    <Box
      ref={menuRef}
      position={"fixed"}
      top={0}
      right={0}
      clipPath={"polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"}
      height={"100vh"}
      width={"100%"}
      zIndex={20}
      background={"primary"}
      px={{ base: 5, sm: 20, md: 40 }}
    >
      <Center>
        <Image src="/dark-logo.svg" width={20} height={20} alt="logo" mt={3} />
      </Center>
      <Text color={"background"} fontSize={"2xl"} mb={4}>
        menu
      </Text>
      <Flex flexDir={"column"}>
        {links.map(({ label, path }, idx) => {
          return (
            <LinkBox
              as={NextLink}
              key={path}
              overflow={"hidden"}
              position={"relative"}
              my={2}
              href={`/${path}`}
              onClick={toggleMenu}
            >
              <Heading
                color={"background"}
                ref={(e: HTMLDivElement) => {
                  if (itemRef.current) itemRef.current[idx] = e;
                }}
                fontSize={{ base: "5xl", md: "7xl" }}
                mb={4}
              >
                {label.toString()}
              </Heading>
              <Divider
                borderColor={"background"}
                borderWidth={"2px"}
                ref={(e: HTMLHRElement) => {
                  if (dividerRef.current) dividerRef.current[idx] = e;
                }}
                clipPath={"polygon(0 0, 0% 0, 0% 100%, 0 100%)"}
              />
            </LinkBox>
          );
        })}
      </Flex>
      <Flex
        position={"absolute"}
        direction={"row"}
        width={{ base: "90%", sm: "70%" }}
        bottom={"7%"}
        justifyContent={"space-between"}
      >
        {/* <JoinBtn /> */}
        <Socials
          justifyContent={"space-evenly"}
          alignItems={"center"}
          width={{ base: "50%", sm: "20%" }}
        />
      </Flex>
    </Box>
  );
}

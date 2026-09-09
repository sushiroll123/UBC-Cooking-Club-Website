import { links } from "@/data/links";
import { Container, Flex, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "../Image";
import Socials from "../Socials";
import Newsletter from "./Newsletter";

export default function MobileFooter() {
  return (
    <>
      <Flex
        as={Container}
        position={"relative"}
        direction={"column"}
        height={363}
        background={"primary"}
        py={10}
        maxWidth={{ base: "2xl", lg: "5xl" }}
      >
        <Newsletter />
        <Flex direction={"row"} w={"100%"} justifyContent={"space-around"}>
          {links.map((navLink) => (
            <Link
              key={navLink.path}
              as={NextLink}
              href={`/${navLink.path}`}
              fontFamily={"heading"}
              fontSize={"md"}
              color={"background"}
              width={"fit-content"}
              py={10}
            >
              {navLink.label.toUpperCase()}
            </Link>
          ))}
        </Flex>
        <Image
          src={"/footer-logo.svg"}
          alt="footer"
          width={350}
          height={350}
          w={400}
          h={"auto"}
          position={"absolute"}
          top={"3rem"}
          right={0}
          zIndex={1}
        />
        <Socials justifyContent={"center"} gap={5} height={"100%"} />
      </Flex>
      <Text
        position={"absolute"}
        bottom={0}
        w={"100%"}
        textAlign={"center"}
        zIndex={10}
        color={"background"}
        fontSize={"sm"}
      >
        UBC Cooking Club &copy; 2025
      </Text>
    </>
  );
}

import { links } from "@/data/links";
import { Container, Flex, Grid, GridItem, Link, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "../Image";
import Socials from "../Socials";
import Newsletter from "./Newsletter";
import JoinBtn from "../navbar/JoinBtn";

export default function DesktopFooter() {
  return (
    <>
      <Grid
        as={Container}
        position={"relative"}
        templateColumns="repeat(2, 1fr)"
        templateRows="repeat(5, 1fr)"
        height={363}
        background={"primary"}
        py={10}
        maxWidth={{ base: "md", md: "2xl", lg: "5xl" }}
      >
        <GridItem
          display={"flex"}
          gap={1}
          rowSpan={3}
          colSpan={1}
          flexDir={"column"}
          w={"100%"}
          h={"100%"}
          position={"relative"}
          justifyContent={"space-between"}
          zIndex={10}
        >
          {links.map((navLink) => (
            <Link
              key={navLink.path}
              as={NextLink}
              href={`/${navLink.path}`}
              fontFamily={"heading"}
              fontSize={{ base: "2xl", md: "3xl" }}
              color={"background"}
              width={"fit-content"}
            >
              {navLink.label.toUpperCase()}
            </Link>
          ))}
        </GridItem>
        <GridItem rowSpan={2} />
        <GridItem rowSpan={2} position={"relative"} zIndex={10}>
          <Newsletter />
        </GridItem>
        <Image
          src={"/footer-logo.svg"}
          alt="footer"
          width={350}
          height={350}
          w={610}
          h={"auto"}
          position={"absolute"}
          top={"-6.5rem"}
          right={{ base: 0, lg: "5%" }}
          zIndex={1}
        />
        <GridItem rowSpan={1} />
        <GridItem rowSpan={2}>
          <Socials width={"50%"} gap={5} height={"100%"} />
          {/* <JoinBtn /> */}
        </GridItem>
      </Grid>
      <Text
        position={"absolute"}
        bottom={0}
        right={"20%"}
        zIndex={10}
        color={"background"}
        fontSize={"sm"}
        p={1}
      >
        UBC Cooking Club &copy; 2024
      </Text>
    </>
  );
}

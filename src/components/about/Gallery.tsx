import {
  Box,
  BoxProps,
  Center,
  Grid,
  GridItem,
  GridItemProps,
  Heading,
  LinkBox,
  LinkOverlay,
} from "@chakra-ui/react";
import React from "react";
import Image from "../Image";
import NextLink from "next/link";

interface CustomItemProps extends GridItemProps {
  children: React.ReactNode;
  isTall?: boolean;
}

const Item = ({ children, isTall = false, ...rest }: CustomItemProps) => {
  return (
    <GridItem
      position={"relative"}
      background={"white"}
      borderRadius={"2xl"}
      overflow={"hidden"}
      maxH={isTall ? "100%" : { base: "100%", lg: 300 }}
      m={{ base: 1, md: 2 }}
      {...rest}
    >
      {children}
    </GridItem>
  );
};

export default function Gallery() {
  const imageStyle: BoxProps = {
    width: 1000,
    height: 1000,
    w: "100%",
    h: "100%",
    objectFit: "cover",
  };
  return (
    <Grid
      w={"100%"}
      height={"fit-content"}
      px={{ base: 1, sm: 10 }}
      templateColumns={"repeat(4,1fr)"}
      templateRows={{ base: "repeat(8,1fr)", md: "repeat(4,1fr)" }}
    >
      <Item colSpan={{ base: 4, md: 2 }} rowSpan={1}>
        <Image src={"/about/gallery/all.webp"} alt="all" {...imageStyle} />
      </Item>
      <Item colSpan={{ base: 4, md: 2 }} rowSpan={2} isTall>
        <Image
          src={"/about/gallery/yachaejeong.webp"}
          alt="all"
          {...imageStyle}
        />
      </Item>
      <Item colSpan={{ base: 2, md: 1 }} rowSpan={1}>
        <Image
          src={"/about/gallery/pan-dumplings.webp"}
          alt="all"
          {...imageStyle}
        />
      </Item>
      <Item colSpan={{ base: 2, md: 1 }} rowSpan={2} isTall>
        <Image
          src={"/about/gallery/sushi-bake.webp"}
          alt="all"
          {...imageStyle}
        />
      </Item>
      <Item colSpan={{ base: 2, md: 1 }} rowSpan={1}>
        <Image
          src={"/about/gallery/sushi-crowd.webp"}
          alt="all"
          {...imageStyle}
        />
      </Item>
      <Item colSpan={{ base: 2, md: 1 }} rowSpan={1}>
        <LinkBox
          as={Center}
          position={"relative"}
          w={"100%"}
          h={"100%"}
          textAlign={"center"}
          flexDir={"column"}
          p={2}
        >
          <Image
            src={"/about/gallery/instagram.svg"}
            alt="all"
            width={10}
            height={10}
            w={"100%"}
            h={"70%"}
            objectFit={"contain"}
            position={"relative"}
          />
          <Heading fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}>
            <LinkOverlay
              as={NextLink}
              href="https://www.instagram.com/cookingclububc"
              target="_blank"
            >
              Follow Us!
            </LinkOverlay>
          </Heading>
        </LinkBox>
      </Item>
      <Item colSpan={{ base: 2, md: 1 }} rowSpan={1}>
        <Image
          src={"/about/gallery/dumplings.webp"}
          alt="all"
          {...imageStyle}
        />
      </Item>
      <Item colSpan={{ base: 4, md: 2 }} rowSpan={1}>
        <Image src={"/about/gallery/taco.webp"} alt="all" {...imageStyle} />
      </Item>
      <Item colSpan={{ base: 4, md: 2 }} rowSpan={1}>
        <Image src={"/about/gallery/crowd.webp"} alt="all" {...imageStyle} />
      </Item>
    </Grid>
  );
}

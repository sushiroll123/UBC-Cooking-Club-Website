import { AspectRatio, Box, Center, Heading } from "@chakra-ui/react";
import Image from "../Image";

export default function Landing() {
  return (
    <Box
      position={"sticky"}
      top={0}
      zIndex={-1}
      width={"100%"}
      height={"100vh"}
    >
      <AspectRatio maxW="100%" objectFit={"cover"} height={"100%"}>
        <video autoPlay muted loop id="myVideo" src="/home/landing.mp4">
          Your browser does not support HTML5 video.
        </video>
      </AspectRatio>
      <Center
        position={"absolute"}
        top={0}
        w={"100%"}
        height={"100%"}
        zIndex={1}
        flexDir={"column"}
      >
        <Image
          src={"/logo.svg"}
          alt="halo"
          height={200}
          width={200}
          w={{ base: 150, md: 300 }}
        />
        <Heading
          mt={{ md: 10 }}
          fontSize={{ base: "3xl", md: "7xl" }}
          color={"background"}
          textAlign={"center"}
        >
          UBC Cooking Club
        </Heading>
      </Center>
      <Box
        position={"absolute"}
        top={0}
        width={"100%"}
        height={"100%"}
        background={"rgb(80,80,80,40%)"}
      />
    </Box>
  );
}

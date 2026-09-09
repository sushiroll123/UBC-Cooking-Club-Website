import Gallery from "@/components/about/Gallery";
import Team from "@/components/about/Team";
import Image from "@/components/Image";
import { Box, Heading } from "@chakra-ui/react";

export default function About() {
  return (
    <Box height={"fit-content"}>
      <Heading
        color={"primary"}
        fontSize={{ base: "4xl", md: "6xl" }}
        mt={40}
        mb={20}
        w={"100%"}
        textAlign={"center"}
      >
        Get To Know More!
      </Heading>
      <Image
        src={"/about/gallery/arrow.svg"}
        alt=""
        width={150}
        height={150}
        position={"absolute"}
        top={0}
        right={0}
        zIndex={-1}
      />
      <Gallery />
      <Team />
    </Box>
  );
}

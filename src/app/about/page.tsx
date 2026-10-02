import Mission from "@/components/about/Mission";
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
        Learn more!
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
      <Mission>
        Brought to you by fellow <strong>food-lovers</strong> and
        <strong> chefs</strong>, we at UBC Cooking Club aim to 
        nurture a <strong>welcoming </strong> 
        and <strong>tight-knit</strong> community; sharing our love for making 
        food with others. We offer <strong>new cooking experiences</strong> for 
        everyone at UBC, whether they be a <strong>well-experienced </strong>
        chef with years of cooking expertise or someone who 
        has <strong>never touched a pot</strong> in their lives!
      </Mission>
      <Gallery />
      <Team />
    </Box>
  );
}

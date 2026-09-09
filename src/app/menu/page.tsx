import Image from "@/components/Image";
import Recipes from "@/components/menu/Recipes";
import { Box, Container, Heading } from "@chakra-ui/react";

export default function MenuPage() {
  return (
    <Container maxW={"7xl"}>
      <Box height={"20vh"} />
      <Heading
        fontFamily={"body"}
        mb={5}
        position={"relative"}
        width={"fit-content"}
      >
        Latest Recipes
        <Image
          src={"/menu/menuIcon.svg"}
          alt="menu"
          width={10}
          height={10}
          position={"absolute"}
          top={"-1.5rem"}
          right={0}
        />
      </Heading>
      <Recipes />
    </Container>
  );
}

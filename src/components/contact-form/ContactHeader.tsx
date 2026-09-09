import { Box, Heading, Flex } from "@chakra-ui/react";

export default function ContactHeader() {
  return (
    <Flex flexDirection="column" alignItems="center">
      <Heading
        color="primary"
        textAlign={"center"}
        fontSize={{ base: "4xl", sm: "5xl", md: "6xl" }}
        fontWeight="300px"
      >
        Reach out to us!
      </Heading>
      <Heading
        color="secondary"
        fontSize={{ base: "xl", sm: "3xl" }}
        fontWeight="200px"
      >
        ~ we wont fry you ~
      </Heading>
    </Flex>
  );
}

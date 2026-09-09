import ContactHeader from "@/components/contact-form/ContactHeader";
import Form from "@/components/contact-form/Form";
import Image from "@/components/Image";
import { Box, Container, Flex } from "@chakra-ui/react";

export default function ContactPage() {
  return (
    <Container maxW={"7xl"} h={{ lg: "100vh" }} pt={"7rem"} mb={10}>
      <ContactHeader />
      <Flex
        direction={{ base: "column", lg: "row" }}
        alignItems="center"
        justifyContent="space-evenly"
        mt={7}
      >
        <Box position={"relative"}>
          <Image
            src="/shallot.svg"
            width={500}
            height={500}
            w={"100%"}
            h={"100%"}
            objectFit={"cover"}
            alt=""
          />
        </Box>
        <Form />
      </Flex>
    </Container>
  );
}

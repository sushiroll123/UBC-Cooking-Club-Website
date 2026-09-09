import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Container,
  Heading,
  Box,
} from "@chakra-ui/react";
import Image from "../Image";
import { faqData } from "@/data";

export default function FAQ() {
  return (
    <Container position={"relative"} my={10}>
      <Image
        src={"/home/icecream.svg"}
        alt=""
        width={300}
        height={400}
        position={"absolute"}
        bottom={0}
        left={-80}
      />
      <Box position={"relative"}>
        <Heading fontFamily={"body"}>FAQ</Heading>
        <Image
          src={"/home/bulbIcon.svg"}
          alt="bulb"
          width={100}
          height={100}
          top={-10}
          left={{ base: 20, md: -24 }}
          position={"absolute"}
          zIndex={-1}
        />
      </Box>
      <Accordion my={7}>
        {faqData.map((data, idx) => (
          <AccordionItem
            key={idx}
            background={"accent"}
            my={5}
            borderRadius={"md"}
          >
            <AccordionButton p={4}>
              <Heading
                as="span"
                fontFamily={"body"}
                fontSize={"lg"}
                flex="1"
                textAlign="left"
              >
                {data.question}
              </Heading>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>{data.answer}</AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  );
}

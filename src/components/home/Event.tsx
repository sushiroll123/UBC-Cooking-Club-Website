import { upcomingEvents } from "@/data";
import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "../Image";

export default function Event() {
  const curr = upcomingEvents[0];
  return (
    <Box pt={10} position={"relative"}>
      <Heading
        position={"relative"}
        fontSize={{ base: "4xl", sm: "6xl" }}
        fontWeight={"regular"}
        textAlign={"center"}
      >
        Let&apos;s Get{" "}
        <span style={{ position: "relative", height: "100%" }}>
          Cookin&apos;
          <Image
            src={"/home/scribble-title.svg"}
            alt="scribble"
            position={"absolute"}
            width={200}
            height={10}
            w={{ base: 150, sm: 200 }}
            bottom={-2}
            right={0}
            zIndex={-1}
            objectFit={"contain"}
          />
        </span>
      </Heading>
      {upcomingEvents.length > 0 ? (
        <Flex
          position={"relative"}
          my={10}
          mx={{ base: "5%", md: "15%" }}
          // maxW={"6xl"}
          direction={{ base: "column", md: "row" }}
          borderRadius={"lg"}
          overflow={"hidden"}
          boxShadow={"xl"}
          height={{ base: "fit-content" }}
        >
          <Box
            position={"relative"}
            width={{ base: "100%", md: 400, lg: "60%" }}
            height={{ base: 300, md: 450 }}
            background={"accent"}
          >
            <Image
              src={curr.imagePath}
              alt="event"
              width={200}
              height={200}
              objectFit={"contain"}
              w={"100%"}
              h={"100%"}
            />
            <Box
              position={"absolute"}
              aspectRatio={1}
              top={0}
              right={0}
              textAlign={"center"}
              w={28}
              bg={"rgba(163, 197, 225, 50%)"}
              p={3}
            >
              <Heading fontStyle={"regular"} fontSize={"5xl"}>
                {curr.date}
              </Heading>
              <Text fontWeight={"bold"}>{curr.month}</Text>
            </Box>
          </Box>
          <Box
            width={{ base: "100%", md: 400, lg: "40%" }}
            background={"accent"}
            px={5}
            py={2}
          >
            <Heading
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              my={3}
              fontWeight={"regular"}
            >
              {curr.title}
            </Heading>
            <Text mt={2}>
              <strong>WHERE:</strong> {curr.location}
            </Text>
            <Text mb={2}>
              <strong>WHEN:</strong> {curr.time}
            </Text>
            <Text>
              <strong>Got Questions?</strong> <br />
              Contact us at <u>ubccookingclubinfo@gmail.com</u>
            </Text>

            {curr.isOpen ? (
              curr.isFull ? (
                <Text color={"secondary"} fontFamily={"heading"} mt={3}>
                  Event is full!
                </Text>
              ) : (
                <Button
                  as={NextLink}
                  href={curr.registerLink}
                  target="_blank"
                  size={"md"}
                  mt={3}
                  background={"secondary"}
                  color={"background"}
                  borderRadius={"md"}
                  fontFamily={"heading"}
                  fontWeight={"regular"}
                  boxShadow={"0 5px 0px #FFF9E1, 0 8px 15px rgba(0, 0, 0, 0.2)"}
                  transition={"transform 0.2s ease, box-shadow 0.2s ease"}
                  _hover={{
                    filter: "brightness(1)",
                  }}
                  _active={{
                    boxShadow:
                      "0px 0px 0px #FFF9E1, 0 6px 10px rgba(0, 0, 0, 0.2)",
                    transform: "translateY(2px)",
                  }}
                >
                  Register
                </Button>
              )
            ) : (
              <Text color={"secondary"} fontFamily={"heading"} mt={3}>
                COMING SOON!
              </Text>
            )}
          </Box>
        </Flex>
      ) : (
        <Text textAlign={"center"} my={10} fontSize={"xl"}>
          Stay tuned for more workshops next year!
        </Text>
      )}
    </Box>
  );
}

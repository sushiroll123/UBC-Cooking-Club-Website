import { Box, Divider, Heading, Text, Flex, Center } from "@chakra-ui/react";
import Image from "../Image";
import { upcomingEvents } from "@/data";

export default function UpcomingEvent() {
  const events = upcomingEvents.slice(1);
  return (
    <Box mx={{ base: "5%", md: "10%" }} mb={10}>
      <Heading fontFamily={"body"} py={5}>
        Stay Tuned for More!
      </Heading>
      {events.length < 1 ? (
        <Text fontSize={"xl"}>No Upcoming Events Yet! :)</Text>
      ) : (
        events.map((event, idx) => {
          return (
            <Box key={idx} textAlign={"center"}>
              <Divider
                orientation="horizontal"
                border={"1px"}
                borderColor={"accent"}
              />
              <Flex as={Center} direction={{ base: "column", md: "row" }}>
                <Box aspectRatio={1} w={28} p={3}>
                  <Heading fontStyle={"regular"} fontSize={"5xl"}>
                    {event.date}
                  </Heading>
                  <Text fontWeight={"bold"}>{event.month}</Text>
                </Box>
                <Image
                  src={event.imagePath}
                  alt="event"
                  width={1000}
                  height={1000}
                  w={28}
                  h={28}
                  objectFit={"cover"}
                />
                <Flex
                  direction={{ base: "column", md: "row" }}
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  w={"100%"}
                  px={5}
                >
                  <Box textAlign={{ base: "unset", md: "start" }}>
                    <Heading fontStyle={"regular"} fontSize={"4xl"}>
                      {event.title}
                    </Heading>
                    <Text>
                      {event.time} / {event.location}
                    </Text>
                  </Box>
                  <Text color={"secondary"} fontFamily={"heading"}>
                    COMING SOON!
                  </Text>
                </Flex>
              </Flex>
            </Box>
          );
        })
      )}
      <Divider orientation="horizontal" border={"1px"} borderColor={"accent"} />
    </Box>
  );
}

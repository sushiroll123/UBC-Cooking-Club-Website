import { Heading, Flex, Box, Text } from "@chakra-ui/react";
import Image from "../Image";

interface ParagraphProps {
    children: React.ReactNode;
}

export default function Mission({ children }: ParagraphProps ) {
    return (
        <>
            <Heading
                color={"primary"}
                fontSize={{ base: "xl", md: "5xl" }}
                mt={0}
                mb={0}
                lineHeight={"none"}
                w={"100%"}
                textAlign={"center"}
            >
                Our Mission
            </Heading>
            <Flex
                w="100%"
                px={{ base: 4, md: 10 }}
                pt={0}
                pb={6}
                gap={{ base: 2, md: 2 }}
                direction={{ base: "column", md: "row" }}
                align="center"
                justify="center"
            >
                <Box w="250px" h="200px" overflow="hidden" flexShrink={0}>
                    <Image
                        src="/graphics/tomato.png"
                        alt=""
                        width={250}
                        height={250}
                        w="100%"
                        h="100%"
                        objectFit="cover"
                        objectPosition="center bottom"
                    />
                    </Box>
                <Text 
                    fontSize={{ base: "md", md: "lg" }}
                    maxW="5xl"
                    mx="auto"
                    lineHeight="short"
                >
                    {children}
                </Text>
            </Flex>
        </>
    );
}
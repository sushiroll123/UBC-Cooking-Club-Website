import Image from "@/components/Image";
import { menuData } from "@/data";
import {
  Container,
  Heading,
  LinkBox,
  LinkOverlay,
  SimpleGrid,
  Tag,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";

export default function Recipes() {
  return (
    <SimpleGrid gap={6} columns={{ base: 1, md: 2, lg: 3 }}>
      {menuData.map((card, idx) => {
        return (
          <LinkBox
            key={idx}
            background={"subtle"}
            h={{ base: "fit-content", md: 440 }}
            borderRadius={"2xl"}
          >
            <LinkOverlay as={NextLink} href={`/menu/${card.id}`} />
            <Image
              src={`/menu/workshops/${card.id}.webp`}
              alt="burger"
              width={400}
              height={200}
              borderRadius={"2xl"}
              w={"100%"}
              h={{ base: 210, sm: 220, md: 240 }}
              objectFit={"cover"}
            />
            <Container p={4}>
              <Heading fontSize={"2xl"} fontFamily={"body"} py={1}>
                {card.title}
              </Heading>
              <Text fontSize={"sm"}>{card.description}</Text>
              {card.tags.map((tag, idx) => {
                return (
                  <Tag
                    key={idx}
                    size={"sm"}
                    variant="subtle"
                    colorScheme="orange"
                    px={3}
                    py={1.5}
                    mr={2}
                    mt={3}
                  >
                    {tag.toUpperCase()}
                  </Tag>
                );
              })}
            </Container>
          </LinkBox>
        );
      })}
    </SimpleGrid>
  );
}

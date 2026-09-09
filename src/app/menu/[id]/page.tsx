import Image from "@/components/Image";
import BulletIcons from "@/components/menu/BulletIcons";
import { menuData } from "@/data";
import {
  Box,
  Container,
  Flex,
  Heading,
  Icon,
  List,
  ListItem,
  OrderedList,
  Text,
  VStack,
} from "@chakra-ui/react";

export async function generateStaticParams() {
  return menuData.map((post) => ({
    slug: post.id,
  }));
}

export default async function Recipe({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const menu = menuData.filter((data) => data.id === id)[0];

  return (
    <Container
      as={Flex}
      pt={32}
      height={"fit-content"}
      maxW={"5xl"}
      justifyContent={"space-between"}
      overflowX={"visible"}
      gap={10}
      direction={{ base: "column", md: "row" }}
    >
      <VStack w={{ md: "50%" }} alignItems={"start"} gap={10}>
        <Heading fontFamily={"body"} fontSize={"5xl"}>
          {menu.title}
        </Heading>
        <Text fontSize={"lg"} lineHeight={2}>
          {menu.description}
        </Text>
        <Heading fontFamily={"body"} fontSize={"xl"} mt={10}>
          How to Make it
        </Heading>
        <OrderedList fontSize={"md"}>
          {menu.steps.map((step, idx) => {
            return (
              <ListItem key={idx} position={"relative"} pl={2} py={2}>
                {step}
                <Icon
                  viewBox="0 0 200 200"
                  boxSize={8}
                  color="accent"
                  position={"absolute"}
                  top={"1%"}
                  left={"-7%"}
                  zIndex={-1}
                >
                  <path
                    fill="currentColor"
                    d="M 100, 100 m -75, 0 a 75,75 0 1,0 150,0 a 75,75 0 1,0 -150,0"
                  />
                </Icon>
              </ListItem>
            );
          })}
        </OrderedList>
      </VStack>
      <VStack w={{ md: "50%" }} alignItems={"start"}>
        <Box
          aspectRatio={1 / 1}
          maxW={"100%"}
          rounded={"xl"}
          position={"relative"}
        >
          <Image
            src={`/menu/workshops/${menu.id}.webp`}
            alt="food"
            width={500}
            height={300}
            w={"100%"}
            h={"100%"}
            rounded={"xl"}
            objectFit={"cover"}
          />
        </Box>
        <Box p={10} background={"subtle"} w={"100%"} rounded={"xl"}>
          <Heading fontFamily={"body"} fontSize={"xl"}>
            Ingredients
          </Heading>
          <List fontSize={"md"} fontWeight={"regular"}>
            {menu.ingredients.map((ingredient, idx) => {
              return (
                <ListItem key={idx} position={"relative"} pl={2} py={2}>
                  <BulletIcons />
                  {ingredient}
                </ListItem>
              );
            })}
          </List>
        </Box>
      </VStack>
    </Container>
  );
}

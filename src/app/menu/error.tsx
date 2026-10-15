"use client";

import { Box, Button, Container, Heading, Text } from "@chakra-ui/react";

export default function MenuError({ reset }: { error: Error; reset: () => void }) {
  return <Container maxW="7xl" pt={32}>
    <Box background="subtle" borderRadius="2xl" p={8}>
      <Heading fontFamily="body" fontSize="2xl">Recipes are unavailable right now</Heading>
      <Text mt={3}>Please try again shortly.</Text>
      <Button mt={5} onClick={reset}>Try again</Button>
    </Box>
  </Container>;
}

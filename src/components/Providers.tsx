import React from "react";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "@/theme";

export default function RootProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChakraProvider theme={theme}>{children}</ChakraProvider>;
}

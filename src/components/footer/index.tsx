"use client";

import { Box, useBreakpointValue } from "@chakra-ui/react";
import DesktopFooter from "./Desktop";
import MobileFooter from "./Mobile";

export default function Footer() {
  const isDesktop = useBreakpointValue({ base: false, md: true });
  return (
    <>
      <Box
        position={"relative"}
        width={"100%"}
        background={"primary"}
        height={"4rem"}
      >
        <Box
          width={"100%"}
          height={"100%"}
          roundedBottom={"full"}
          position={"absolute"}
          top={0}
          background={"background"}
          zIndex={5}
        />
      </Box>
      <footer>{isDesktop ? <DesktopFooter /> : <MobileFooter />}</footer>
    </>
  );
}

"use client";

import { extendTheme } from "@chakra-ui/react";
import { helloChunky, body } from "./fonts";

const theme = extendTheme({
  colors: {
    primary: "#073574",
    secondary: "#DD8004",
    background: "#FFF9E1",
    accent: "rgba(163, 197, 225, 80%)",
    subtle: "rgba(255, 251, 235, 100%)",
  },
  fonts: {
    heading: helloChunky.style.fontFamily,
    body: body.style.fontFamily,
  },
  styles: {
    global: {
      // Optionally set global CSS styles
      body: {
        color: "primary",
        background: "background",
        overflowX: "hidden",
        position: "relative",
      },
      footer: {
        background: "primary",
      },
      "ol > li::marker": {
        fontWeight: "bold",
        mr: 10,
      },
    },
  },
});

export default theme;

"use client";

import FAQ from "@/components/home/FAQ";
import Landing from "@/components/home/Landing";
import Workshop from "@/components/home/Workshop";
import Event from "@/components/home/Event";
import { Box } from "@chakra-ui/react";
import UpcomingEvent from "@/components/home/Upcoming";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    (async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;
      const locomotiveScroll = new LocomotiveScroll();
    })();
  }, []);
  return (
    <Box overflowX={"hidden"}>
      <Box position={"relative"}>
        <Landing />
        <Event />
      </Box>
      <UpcomingEvent />
      <Workshop />
      <FAQ />
    </Box>
  );
}

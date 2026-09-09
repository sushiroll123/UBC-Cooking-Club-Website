"use client";

import { MemberType } from "@/data";
import { Box, Center, GridItem, Text } from "@chakra-ui/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Suspense, useEffect, useRef, useState } from "react";
import Image from "../Image";

gsap.registerPlugin(useGSAP);

export default function Card(props: { person: MemberType }) {
  const { person } = props;
  const imgPath = person.name.toLocaleLowerCase().split(" ").join("");

  const [active, setActive] = useState<boolean>(false);

  const overlay = useRef<HTMLDivElement>(null);
  const tl = useRef<GSAPTimeline>();

  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true });
    gsap.set(overlay.current, { yPercent: -100 });
    tl.current.to(overlay.current, {
      yPercent: 0,
      duration: 0.7,
      ease: "power2.inOut",
    });
  });

  useEffect(() => {
    active ? tl.current?.play() : tl.current?.reverse();
  }, [active]);

  return (
    <GridItem
      colSpan={1}
      height={"fit-content"}
      position={"relative"}
      onMouseEnter={() => {
        tl.current?.play();
        setActive(true);
      }}
      onMouseLeave={() => {
        tl.current?.reverse();
        setActive(false);
      }}
      onClick={() => setActive(!active)}
      overflow={"hidden"}
      outline={"2px solid"}
    >
      <Suspense>
        <Image
          src={`${
            !person.hasImage
              ? "/graphics/onion.svg"
              : `/about/team/${imgPath}.webp`
          }`}
          width={500}
          height={500}
          alt="person"
          w={"100%"}
          h={{ base: 400, sm: 300 }}
          objectFit={!person.hasImage ? "contain" : "cover"}
          outline={"2px"}
          outlineColor={"primary"}
          // _hover={{ opacity: 0.7, transition: "0.2s" }}
        />
      </Suspense>
      {/* <Text textAlign={"center"} p={2}>
        &quot;Most likely to fly to space with car&quot;
      </Text> */}
      <Box
        ref={overlay}
        className="overlay"
        position={"absolute"}
        background={"secondary"}
        top={0}
        h={{ base: 400, sm: 300 }}
        width={"100%"}
        zIndex={10}
        opacity={1}
        onClick={() => setActive(!active)}
      >
        <Center h={"100%"}>
          <Box textAlign={"center"}>
            <Text fontWeight={"bold"}>{person.name}</Text>
            {/* <Text>2nd Year</Text> */}
            <Text w={"100%"}>{person.role}</Text>
          </Box>
        </Center>
      </Box>
    </GridItem>
  );
}

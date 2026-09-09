"use client";

import Image from "@/components/Image";
import { links } from "@/data";
import {
  Box,
  Flex,
  IconButton,
  Link,
  useBreakpointValue,
} from "@chakra-ui/react";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";

import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";

import Hamburger from "./Hamburger";
import JoinBtn from "./JoinBtn";
import Menu from "./Menu";

gsap.registerPlugin(useGSAP);

export default function Navbar() {
  const [active, setActive] = useState<boolean>(false);
  const isMobile = useBreakpointValue({ base: true, md: false });

  const menuRef = useRef<HTMLDivElement>(null);
  const itemRef = useRef<HTMLDivElement[]>([]);
  const dividerRef = useRef<HTMLHRElement[]>([]);
  const top = useRef<SVGLineElement>(null);
  const bot = useRef<SVGLineElement>(null);
  const tl = useRef<GSAPTimeline>();

  const toggleMenu = () => {
    setActive(!active);
  };

  useGSAP(() => {
    tl.current = gsap.timeline({ paused: true });
    tl.current
      .to(top.current, { y: "-9px", rotate: "45deg", duration: 0.3 }, 0)
      .to(
        bot.current,
        {
          y: "9px",
          rotate: "-45deg",
          duration: 0.2,
        },
        0
      );

    gsap.set(itemRef.current, { y: 100 });
    tl.current
      .to(
        menuRef.current,
        {
          duration: 1.25,
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
          ease: "power4.inOut",
        },
        0
      )
      .to(dividerRef.current, {
        clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
        duration: 1,
        stagger: 0.1,
        delay: -0.75,
        ease: "power4.inOut",
      })
      .to(itemRef.current, {
        y: 0,
        duration: 1,
        stagger: 0.1,
        delay: -1,
        ease: "power4.inOut",
      });
  });

  useEffect(() => {
    active ? tl.current?.play() : tl.current?.reverse();
  }, [active]);

  return (
    <Flex
      justifyContent={"space-between"}
      alignItems={"center"}
      position={"fixed"}
      top={0}
      width={"100%"}
      background={"background"}
      zIndex={50}
      py={1}
      px={6}
    >
      <Image src={"/logo.svg"} width={16} height={16} alt={"img"} />
      <Box />
      {!isMobile && (
        <Flex justifyContent={"space-around"} w={{ md: 400, lg: 500 }}>
          {links.map(({ label, path }, idx) => {
            return (
              <Link key={idx} as={NextLink} href={`/${path}`}>
                {label.toLowerCase()}
              </Link>
            );
          })}
        </Flex>
      )}
      <Flex
        width={"20%"}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        {!isMobile && <JoinBtn />}
        <IconButton
          variant="unstyled"
          aria-label="hamburger"
          background={"transparent"}
          icon={<Hamburger top={top} bot={bot} />}
          onClick={toggleMenu}
        />
      </Flex>
      <Menu
        menuRef={menuRef}
        itemRef={itemRef}
        dividerRef={dividerRef}
        toggleMenu={toggleMenu}
      />
    </Flex>
  );
}

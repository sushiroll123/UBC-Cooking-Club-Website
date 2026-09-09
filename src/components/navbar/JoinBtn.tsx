"use client";

import { Button, Icon } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";
import NextLink from "next/link";

export default function JoinBtn() {
  return (
    <NextLink
      href={"https://linktr.ee/ubccookingclub"}
      target="_blank"
      passHref
    >
      <Button
        size={"sm"}
        variant={"outline"}
        borderColor={"secondary"}
        color={"secondary"}
        borderRadius={"full"}
        fontFamily={"heading"}
        leftIcon={<Icon as={FaCircle} color={"#90EE90"} boxSize={3} mr={2} />}
        _hover={{
          background: "secondary",
          color: "background",
        }}
      >
        Join Us!
      </Button>
    </NextLink>
  );
}

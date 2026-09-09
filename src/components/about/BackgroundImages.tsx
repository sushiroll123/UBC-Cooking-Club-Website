import { Box } from "@chakra-ui/react";
import Image from "../Image";

export default function BackgroundImages() {
  return (
    <>
      {/* <Image
        src="/gallery/pot.svg"
        alt=""
        width={100}
        height={100}
        position={"absolute"}
        top={"-2rem"}
        right={0}
        zIndex={-1}
      /> */}
      <Image
        src="/about/gallery/stars.svg"
        alt=""
        width={250}
        height={250}
        position={"absolute"}
        top={"15rem"}
        left={"-25%"}
      />
    </>
  );
}

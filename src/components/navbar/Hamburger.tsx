import { RefObject } from "react";

export default function Hamburger({
  top,
  bot,
}: {
  top: RefObject<SVGLineElement>;
  bot: RefObject<SVGLineElement>;
}) {
  return (
    <svg
      width="48px"
      height="48px"
      viewBox="0 0 48 48"
      version="1.1"
      xmlns="http://www.w3.org/2000/motion.svg"
      style={{ position: "relative", zIndex: 100 }}
    >
      <g>
        <line
          ref={top}
          x1="0"
          y1="14"
          x2="48"
          y2="14"
          strokeWidth="3"
          stroke="#DD8004"
        />
        <line
          ref={bot}
          x1="0"
          y1="28"
          x2="48"
          y2="28"
          strokeWidth="3"
          stroke="#DD8004"
        />
      </g>
    </svg>
  );
}

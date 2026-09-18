import localFont from "next/font/local";

const body = localFont({
  src: [
    {
      path: "../../public/fonts/talina-demo.regular.otf",
      weight: "500",
    },
    {
      path: "../../public/fonts/montserrat.medium.otf",
      weight: "400",
    },
    
  ],
  display: "swap",
});

const helloChunky = localFont({
  src: "../../public/fonts/hello-chunky.regular.otf",
  display: "swap",
});

export { body, helloChunky };

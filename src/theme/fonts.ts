import localFont from "next/font/local";

const now = localFont({
  src: [
    {
      path: "../../public/fonts/Now-Regular.otf",
      weight: "400",
    },
    {
      path: "../../public/fonts/Now-Bold.otf",
      weight: "500",
    },
  ],
  display: "swap",
});

const moreSugar = localFont({
  src: "../../public/fonts/MoreSugar-Regular.otf",
  display: "swap",
});

export { now, moreSugar };

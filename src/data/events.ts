interface EventType {
  title: string;
  imagePath: string;
  date: string;
  month: string;
  location: string;
  time: string;
  registerLink: string;
  isOpen: boolean;
  isFull: boolean;
}

export const upcomingEvents: EventType[] = [
  // {
  //   title: "Workshop TBA",
  //   imagePath: "/graphics/taco.png",
  //   date: "--",
  //   month: "Jan",
  //   location: "UBC",
  //   time: "January 1st, 2026 : 7:30-9:30pm",
  //   registerLink: "",
  //   isOpen: false,
  //   isFull: false,
  // },
  {
    title: "Onigiri Workshop",
    imagePath: "/graphics/taco.png",
    date: "02",
    month: "OCT",
    location: "TBA",
    time: "October 2nd, 2026 : 7:30-9:30pm",
    registerLink: "",
    isOpen: false,
    isFull: false,
  },
];

interface EventType {
  title: string;
  imagePath: string;
  date: string;
  month: string;
  location: string;
  time: string;
  registerLink: string;
  isOpen: boolean;
  mapUrl: string;
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
  //   mapUrl: "",
  // },
  {
    title: "Halloween Workshop",
    imagePath: "/graphics/taco.png",
    date: "30",
    month: "Oct",
    location: "Tallwood Collegia",
    time: "October 30th, 2026 : 7:30-9:30pm",
    registerLink: "",
    isOpen: false,
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d578.4986250263952!2d-123.25222858582147!3d49.26921197415654!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548673fcfda07f91%3A0x669954f99418eadf!2sTallwood%20Collegium%20(UBC%20Collegia)!5e0!3m2!1sen!2sca!4v1792545285879!5m2!1sen!2sca",
  },
];

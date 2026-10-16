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
    title: "Gnocchi Workshop",
    imagePath: "/graphics/taco.png",
    date: "16",
    month: "Oct",
    location: "Food, Nutrition, and Health (FNH) Building; Room 130",
    time: "October 16th, 2026 : 5:30-7:30pm",
    registerLink: "https://forms.gle/n9NAbH43ac42h9gB6",
    isOpen: false,
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2603.6445236741033!2d-123.25219962345383!3d49.2641832720639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x548673efabb26a5b%3A0x18186abbdb8ac5e0!2sUBC%20Food%2C%20Nutrition%20and%20Health%20(FNH)%20-%20Hallway%20Informal%20Learning%20Space!5e0!3m2!1sen!2sca!4v1792008284036!5m2!1sen!2sca",
  },
];

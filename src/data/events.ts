export interface EventType {
  title: string;
  imagePath: string;
  date: string;
  month: string;
  location: string;
  time: string;
  registerLink: string;
  isOpen: boolean;
  availability: string;
  mapUrl: string;
}

const SS_ID = "";
const SHEET_ID = "";
const url = `https://docs.google.com/spreadsheets/d/${SS_ID}/gviz/tq?tqx=out:json&gid=${SHEET_ID}`;

async function getCount(): Promise<string> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    const text = await res.text();

    const json = JSON.parse(text.substring(text.indexOf("{"), text.lastIndexOf("}") + 1));

    return json["table"]["rows"].length.toString();
  } catch (e) {
    console.error("Sheet fetch failed:", e);
    return "?";
  }
}

export async function  getUpcomingEvents(): Promise<EventType[]> {
  return [
    // {
    //   title: "Workshop TBA",
    //   imagePath: "/graphics/taco.png",
    //   date: "--",
    //   month: "Jan",
    //   location: "UBC",
    //   time: "January 1st, 2026 : 7:30-9:30pm",
    //   registerLink: "",
    //   isOpen: false,
    //   availability: "getCount()";
    //   mapUrl: "";
    // },
    {
      title: "Workshop TBA",
      imagePath: "/graphics/taco.png",
      date: "--",
      month: "Jan",
      location: "UBC",
      time: "January 1st, 2026 : 7:30-9:30pm",
      registerLink: "",
      isOpen: false,
      availability: await getCount(),
      mapUrl: "",
    },
  ];
}

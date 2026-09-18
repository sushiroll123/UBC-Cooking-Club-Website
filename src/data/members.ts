interface TeamType {
  team: string;
  members: MemberType[];
}

export interface MemberType {
  name: string;
  role: string;
  hasImage?: boolean;
}

export const teamData: TeamType[] = [
  {
    team: "admin",
    members: [
      { name: "Anna Xie", role: "Co-President", hasImage: true },
      { name: "Jenny", role: "Co-President", hasImage: false },
      { name: "Daniel Zhang", role: "Developer", hasImage: false },
      { name: "McEwen Gutierrez", role: "Treasurer", hasImage: true },
    ],
  },
  {
    team: "cooking",
    members: [
      { name: "Daniel Zhang", role: "Cooking Director", hasImage: false },
      { name: "Elaine Lo", role: "Cooking Director", hasImage: false },
      { name: "Ada Zhou", role: "Cooking Coordinator" },
      { name: "Beatrix", role: "Cooking Coordinator", hasImage: false },
      { name: "Renee", role: "Cooking Coordinator" },
      { name: "Matthew", role: "Cooking Coordinator", hasImage: false },
      { name: "Takeo Iwase", role: "Cooking Coordinator", hasImage: true },
    ],
  },
  {
    team: "marketing",
    members: [],
  },
  {
    team: "partnership",
    members: [],
  },
  {
    team: "internal",
    members: [
      { name: "Daniel Guo", role: "Internal Director", hasImage: true },
      { name: "Raylene", role: "Internal Director", hasImage: false },
      { name: "Leah", role: "Internal Coordinator", hasImage: false },
      { name: "Adrin", role: "Internal Coordinator", hasImage: false },
      
    ],
  },
  {
    team: "finance",
    members: [
      { name: "Aaron", role: "", hasImage: false },
    ]
  }
];

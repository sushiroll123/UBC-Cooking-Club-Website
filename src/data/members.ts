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
    ],
  },
  {
    team: "cooking",
    members: [
      { name: "Daniel Zhang", role: "Cooking Director", hasImage: false },
      { name: "Elaine Lo", role: "Cooking Director", hasImage: false },
      { name: "Ada Zhou", role: "Cooking Coordinator", hasImage: false},
      { name: "Renee", role: "Cooking Coordinator", hasImage: false},
      { name: "Maple", role: "Cooking Coordinator", hasImage: false },
      { name: "Matthew Wong", role: "Cooking Coordinator", hasImage: false },
      { name: "Melody", role: "Cooking Coordinator", hasImage: false },
      { name: "Nicole", role: "Cooking Coordinator", hasImage: false },
      { name: "Yuma", role: "Cooking Coordinator", hasImage: true },
      { name: "Beatrix", role: "Cooking Coordinator", hasImage: false },
      { name: "Takeo Iwase", role: "Cooking Coordinator", hasImage: true },
    ],
  },
  {
    team: "marketing",
    members: [
      { name: "Eliza", role: "Marketing Director", hasImage: false },
      { name: "Jeanne", role: "Photographer", hasImage: false },
      { name: "Fiona", role: "Marketing Coordinator", hasImage: false },
      { name: "Kimia", role: "Marketing Coordinator", hasImage: false },
    ],
  },
  {
    team: "partnership",
    members: [
      { name: "Colin", role: "Partnership Representative", hasImage: false },
    ],
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
      { name: "Beatrix", role: "Jr. Treasurer", hasImage: false },
      { name: "Aaron", role: "Treasurer", hasImage: false },
    ]
  }
];

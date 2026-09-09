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
      { name: "Umang Ajmera", role: "President", hasImage: true },
      { name: "Nathan Wu", role: "Vice President", hasImage: true },
      { name: "McEwen Gutierrez", role: "Treasurer", hasImage: true },
    ],
  },
  {
    team: "cooking",
    members: [
      { name: "Cristin Cheung", role: "Cooking Director", hasImage: true },
      { name: "Sarah Toy", role: "Cooking Director", hasImage: true },
      { name: "Ada Zhou", role: "Cooking Coordinator" },
      { name: "Anna Xie", role: "Cooking Coordinator", hasImage: true },
      { name: "Jane Nguyen", role: "Cooking Coordinator" },
      { name: "Jessica Lin", role: "Cooking Coordinator", hasImage: true },
      { name: "Linh Ha", role: "Cooking Coordinator" },
      { name: "Shriya Dua", role: "Cooking Coordinator" },
      { name: "Takeo Iwase", role: "Cooking Coordinator", hasImage: true },
      { name: "Tracy Ngo", role: "Cooking Coordinator", hasImage: true },
      { name: "Yujia Zeng", role: "Cooking Coordinator", hasImage: true },
      { name: "Yujin Han", role: "Cooking Coordinator" },
    ],
  },
  {
    team: "marketing",
    members: [
      { name: "Prudence Hung", role: "Marketing Director", hasImage: true },
      { name: "Caitlin Serafino", role: "Marketing Director", hasImage: true },
      { name: "Joyce Lau", role: "Social Media Rep", hasImage: true },
      { name: "Katie Chang", role: "Social Media Rep" },
      { name: "Leo Shang", role: "Graphic Designer", hasImage: true },
      { name: "Jessica Wang", role: "Graphic Designer", hasImage: true },
      {
        name: "Kelvin Zhou",
        role: "Photographer / Videographer",
        hasImage: true,
      },
      {
        name: "Leann Tham",
        role: "Photographer / Videographer",
        hasImage: true,
      },
      {
        name: "Yingdoe Chen",
        role: "Photographer / Videographer",
        hasImage: true,
      },
      { name: "Matthew Haryanto", role: "Web Developer", hasImage: true },
      { name: "Alisa", role: "Web Developer" },
      {
        name: "Jeanne Lee",
        role: "Content Research and Development Coordinator",
        hasImage: true,
      },
    ],
  },
  {
    team: "partnership",
    members: [
      {
        name: "Luna Yu",
        role: "Partnership + Outreach Director",
        hasImage: true,
      },
      { name: "Issac Cheung", role: "Partnership + Outreach Director" },
      {
        name: "Dilpreet Kaur",
        role: "Partnership + Outreach Coordinator",
        hasImage: true,
      },
      { name: "Zak", role: "Partnership + Outreach Coordinator" },
      {
        name: "Twarit Arora",
        role: "Partnership + Outreach Coordinator",
        hasImage: true,
      },
      { name: "Simona Kolvek", role: "Partnership + Outreach Coordinator" },
    ],
  },
  {
    team: "internal",
    members: [
      { name: "Aundrea Henry", role: "Internal Director", hasImage: true },
      { name: "Charmee Shah", role: "Internal Director", hasImage: true },
      { name: "Benjamin Wong", role: "Internal Coordinator", hasImage: true },
      { name: "Daniel Guo", role: "Internal Coordinator", hasImage: true },
      { name: "Sakshi Chawla", role: "Internal Coordinator", hasImage: true },
    ],
  },
];

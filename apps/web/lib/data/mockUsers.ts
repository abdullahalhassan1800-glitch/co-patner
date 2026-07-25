export interface OnlineUser {
  id: string;
  name: string;
  age: number;
  country: string;
  gender: "male" | "female";
  avatar: string;
  isOnline: boolean;
  isLive: boolean;
  rating: number;
  tags: string[];
  bio: string;
  interests: string[];
}

const AVATARS_MALE = [
  "https://i.pravatar.cc/300?img=11",
  "https://i.pravatar.cc/300?img=12",
  "https://i.pravatar.cc/300?img=14",
  "https://i.pravatar.cc/300?img=15",
  "https://i.pravatar.cc/300?img=16",
  "https://i.pravatar.cc/300?img=18",
  "https://i.pravatar.cc/300?img=33",
  "https://i.pravatar.cc/300?img=36",
  "https://i.pravatar.cc/300?img=51",
  "https://i.pravatar.cc/300?img=53",
  "https://i.pravatar.cc/300?img=57",
  "https://i.pravatar.cc/300?img=60",
  "https://i.pravatar.cc/300?img=64",
  "https://i.pravatar.cc/300?img=68",
  "https://i.pravatar.cc/300?img=71",
];

const AVATARS_FEMALE = [
  "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_3_n_compressed.webp",
  "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_4_n_compressed.webp",
  "https://flirtbate-storage.ams3.cdn.digitaloceanspaces.com/carousel-media/model_5_n_compressed.webp",
  "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/qu902z6w8gq_1745733478812_compressed.webp",
  "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/9e4pg47j6g9_1761790088898.webp",
  "https://flirtbate-profile-media.ams3.cdn.digitaloceanspaces.com/no8q0r1sfsg_1784449793329.1784449792495431",
];

const NAMES_M = ["Alex", "Marcus", "Jake", "Ryan", "Ethan", "Noah", "Liam", "Mason", "Logan", "James", "Aiden", "Owen", "Sam", "Tyler", "Caleb", "Nathan", "Dylan", "Kai", "Leo", "Isaac"];
const NAMES_F = ["Sophia", "Emma", "Olivia", "Ava", "Mia", "Luna", "Zoe", "Chloe", "Aria", "Lily", "Ella", "Maya", "Iris", "Nora", "Ruby", "Stella", "Hazel", "Ivy", "Jade", "Violet"];

const COUNTRIES = ["US", "GB", "CA", "AU", "DE", "FR", "JP", "BR", "IN", "MX", "KR", "IT", "ES", "NL", "SE"];
const COUNTRY_NAMES: Record<string, string> = { US: "United States", GB: "United Kingdom", CA: "Canada", AU: "Australia", DE: "Germany", FR: "France", JP: "Japan", BR: "Brazil", IN: "India", MX: "Mexico", KR: "South Korea", IT: "Italy", ES: "Spain", NL: "Netherlands", SE: "Sweden" };

const INTERESTS = ["Music", "Gaming", "Travel", "Movies", "Photography", "Cooking", "Fitness", "Art", "Reading", "Hiking", "Coding", "Dance", "Yoga", "Surfing", "Tech", "Fashion", "Food", "Nature", "Science", "Sports"];

const TAGS = ["Top Rated", "New", "Popular", "Active"];

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export function generateMockUsers(count: number = 60): OnlineUser[] {
  const users: OnlineUser[] = [];

  for (let i = 0; i < count; i++) {
    const gender = "female";
    const names = NAMES_F;
    const avatars = AVATARS_FEMALE;
    const country = randomPick(COUNTRIES);

    users.push({
      id: `user-${i + 1}`,
      name: randomPick(names),
      age: Math.floor(Math.random() * 20) + 18,
      country,
      gender,
      avatar: avatars[i % avatars.length],
      isOnline: true,
      isLive: Math.random() > 0.7,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
      tags: randomSubset(TAGS, 0, 2),
      bio: "",
      interests: randomSubset(INTERESTS, 2, 5),
    });
  }

  return users;
}

export function getCountryFlag(code: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸", GB: "🇬🇧", CA: "🇨🇦", AU: "🇦🇺", DE: "🇩🇪", FR: "🇫🇷",
    JP: "🇯🇵", BR: "🇧🇷", IN: "🇮🇳", MX: "🇲🇽", KR: "🇰🇷", IT: "🇮🇹",
    ES: "🇪🇸", NL: "🇳🇱", SE: "🇸🇪",
  };
  return flags[code] || "🌍";
}

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || "Unknown";
}

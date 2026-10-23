export const EVENT_CATEGORIES = [
  "MUSIC",
  "WORKSHOP",
  "FOOD",
  "SPORTS",
  "KIDS",
] as const;

export type EventCategoryType = (typeof EVENT_CATEGORIES)[number];

export const USER_ROLES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const POPULAR_CITIES = [
  "Coimbatore",
  "Chennai",
  "Bengaluru",
  "Indore",
  "Mumbai",
] as const;

export interface CardTheme {
  id: string;
  name: string;
  gradientClass: string;
  textColorClass: string;
  badgeBgClass: string;
}

export const CARD_THEMES: Record<string, CardTheme> = {
  sunset: {
    id: "sunset",
    name: "Sunset Glow",
    gradientClass: "from-amber-500 via-rose-500 to-purple-600",
    textColorClass: "text-white",
    badgeBgClass: "bg-white/20 text-white backdrop-blur-sm",
  },
  ocean: {
    id: "ocean",
    name: "Ocean Breeze",
    gradientClass: "from-cyan-500 via-blue-600 to-indigo-700",
    textColorClass: "text-white",
    badgeBgClass: "bg-white/20 text-white backdrop-blur-sm",
  },
  forest: {
    id: "forest",
    name: "Mystic Forest",
    gradientClass: "from-emerald-500 via-teal-600 to-stone-800",
    textColorClass: "text-white",
    badgeBgClass: "bg-white/20 text-white backdrop-blur-sm",
  },
};

export const AVAILABLE_STICKERS = ["🎉", "🔥", "❤️", "⭐", "🚀"] as const;
export type StickerType = (typeof AVAILABLE_STICKERS)[number];

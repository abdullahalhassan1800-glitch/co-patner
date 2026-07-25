import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFlagEmoji(countryCode: string): string {
  const flags: Record<string, string> = {
    IN: "🇮🇳", US: "🇺🇸", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷", JP: "🇯🇵",
    KR: "🇰🇷", BR: "🇧🇷", RU: "🇷🇺", CA: "🇨🇦", AU: "🇦🇺", MX: "🇲🇽",
    IT: "🇮🇹", ES: "🇪🇸", NL: "🇳🇱", SE: "🇸🇪", PK: "🇵🇰", BD: "🇧🇩",
    NG: "🇳🇬", EG: "🇪🇬", TR: "🇹🇷", SA: "🇸🇦", AE: "🇦🇪", SG: "🇸🇬",
  };
  return flags[countryCode.toUpperCase()] || "🌍";
}

export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    IN: "India", US: "United States", GB: "United Kingdom", DE: "Germany",
    FR: "France", JP: "Japan", KR: "South Korea", BR: "Brazil", RU: "Russia",
    CA: "Canada", AU: "Australia", MX: "Mexico", IT: "Italy", ES: "Spain",
    NL: "Netherlands", SE: "Sweden", PK: "Pakistan", BD: "Bangladesh",
    ALL: "All Countries",
  };
  return countries[code.toUpperCase()] || code;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // Replace non-alphanumeric with dashes
    .replace(/^-+|-+$/g, ""); // Trim leading/trailing dashes
}

export function getTimeUntilAiring(timestamp: number): string {
  const now = Date.now() / 1000;
  const timeUntil = timestamp - now;

  if (timeUntil <= 0) {
    return "Aired";
  }

  const days = Math.floor(timeUntil / (24 * 60 * 60));
  const hours = Math.floor((timeUntil % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((timeUntil % (60 * 60)) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}
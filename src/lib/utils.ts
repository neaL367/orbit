import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Bangkok",
  }).format(new Date(Date.UTC(2000, 0, 1, hours, minutes)))
}

export function getDayOfWeek(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
}

// Helper function to get current season
export function getCurrentSeason(): { season: string; year: number } {
  const date = new Date()
  const month = date.getMonth() + 1
  const year = date.getFullYear()

  let season
  if (month >= 3 && month <= 5) {
      season = "SPRING"
  } else if (month >= 6 && month <= 8) {
      season = "SUMMER"
  } else if (month >= 9 && month <= 11) {
      season = "FALL"
  } else {
      season = "WINTER"
  }

  return { season, year }
}

// Helper function to format anime status
export function formatStatus(status: string): string {
  switch (status) {
      case "FINISHED":
          return "Finished"
      case "RELEASING":
          return "Airing"
      case "NOT_YET_RELEASED":
          return "Coming Soon"
      case "CANCELLED":
          return "Cancelled"
      default:
          return status
  }
}

// Helper function to format anime format
export function formatFormat(format: string): string {
  switch (format) {
      case "TV":
          return "TV Series"
      case "TV_SHORT":
          return "TV Short"
      case "MOVIE":
          return "Movie"
      case "SPECIAL":
          return "Special"
      case "OVA":
          return "OVA"
      case "ONA":
          return "ONA"
      case "MUSIC":
          return "Music"
      default:
          return format
  }
}


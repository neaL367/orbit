export const SEASONS = ["winter", "spring", "summer", "fall"] as const;
export type Season = (typeof SEASONS)[number];

export const SEASON_COLORS = {
  winter: "from-blue-500 to-cyan-300",
  spring: "from-pink-500 to-pink-300",
  summer: "from-orange-500 to-amber-300",
  fall: "from-red-500 to-orange-300",
};

export const FORMAT_ORDER = [
  "TV",
  "MOVIE",
  "OVA",
  "ONA",
  "SPECIAL",
  "MUSIC",
  "TV_SHORT",
  "UNKNOWN",
];

export function getCurrentSeason() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let season: Season;
  if (month >= 1 && month <= 3) {
    season = "winter";
  } else if (month >= 4 && month <= 6) {
    season = "spring";
  } else if (month >= 7 && month <= 9) {
    season = "summer";
  } else {
    season = "fall";
  }

  return { year, season };
}

export function getNextSeason(season: Season, year: number) {
  const index = SEASONS.indexOf(season);
  return index === SEASONS.length - 1
    ? { season: SEASONS[0], year: year + 1 }
    : { season: SEASONS[index + 1], year };
}

export function getPreviousSeason(season: Season, year: number) {
  const index = SEASONS.indexOf(season);
  return index === 0
    ? { season: SEASONS[SEASONS.length - 1], year: year - 1 }
    : { season: SEASONS[index - 1], year };
}

export function formatSeasonName(season: string) {
  return season.charAt(0).toUpperCase() + season.slice(1);
}

export function getSeasonEmoji(season: Season) {
  switch (season) {
    case "winter":
      return "❄️";
    case "spring":
      return "🌸";
    case "summer":
      return "☀️";
    case "fall":
      return "🍂";
    default:
      return "";
  }
}
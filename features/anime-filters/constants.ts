import type { MediaFormat, MediaSeason, MediaStatus } from "@/graphql/graphql"

export const COMMON_GENRES = [
  "Action",
  "Adventure",
  "Comedy",
  "Drama",
  "Ecchi",
  "Fantasy",
  "Horror",
  "Mahou Shoujo",
  "Mecha",
  "Music",
  "Mystery",
  "Psychological",
  "Romance",
  "Sci-Fi",
  "Slice of Life",
  "Sports",
  "Supernatural",
  "Thriller",
]

export const FORMATS: { value: MediaFormat; label: string }[] = [
  { value: "TV" as MediaFormat, label: "TV" },
  { value: "MOVIE" as MediaFormat, label: "Movie" },
  { value: "OVA" as MediaFormat, label: "OVA" },
  { value: "ONA" as MediaFormat, label: "ONA" },
  { value: "SPECIAL" as MediaFormat, label: "Special" },
]

export const SEASONS: { value: MediaSeason; label: string }[] = [
  { value: "WINTER" as MediaSeason, label: "Winter" },
  { value: "SPRING" as MediaSeason, label: "Spring" },
  { value: "SUMMER" as MediaSeason, label: "Summer" },
  { value: "FALL" as MediaSeason, label: "Fall" },
]

export const STATUSES: { value: MediaStatus; label: string }[] = [
  { value: "RELEASING" as MediaStatus, label: "Releasing" },
  { value: "FINISHED" as MediaStatus, label: "Finished" },
  { value: "NOT_YET_RELEASED" as MediaStatus, label: "Not Yet Released" },
  { value: "CANCELLED" as MediaStatus, label: "Cancelled" },
  { value: "HIATUS" as MediaStatus, label: "Hiatus" },
]


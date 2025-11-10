# Orbit - Anime Discovery Platform

Modern anime browsing platform built with Next.js 16, featuring real-time AniList API data, advanced filtering, and intuitive UI.

## ✨ Features

- **Discovery**: Trending, Popular, Top Rated, Seasonal, Upcoming, Schedule, Search
- **Filtering**: Multi-select genres, year, season, format, status with URL-synced state
- **Details**: Rich media, trailers, characters, recommendations, streaming links
- **Performance**: Intelligent caching, lazy loading, optimized queries

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Data**: React Query + GraphQL (AniList API)
- **Codegen**: GraphQL Code Generator
- **Icons**: Lucide React

## 🚀 Quick Start

```bash
# Install dependencies
bun install

# Generate GraphQL types
bun run codegen

# Run development server
bun dev
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── _components/              # Shared components
│   │   ├── anime-card/          # Anime card component
│   │   ├── carousel/            # Carousel components
│   │   ├── home/                # Home page components
│   │   ├── layout/              # Header & Footer
│   │   └── providers/           # React Query providers
│   ├── (pages)/                  # Route groups
│   │   ├── anime/               # Anime listing & detail
│   │   │   ├── _components/    # Filters, list, detail views
│   │   │   ├── _hooks/         # useAnimeFilters, useAnimeList
│   │   │   └── [animeId]/      # Dynamic detail pages
│   │   └── schedule/            # Schedule page
│   ├── api/graphql/              # GraphQL API route
│   └── layout.tsx                # Root layout
├── components/ui/                # shadcn/ui components
├── hooks/                        # Shared React hooks
├── lib/                          # Utilities & constants
│   └── graphql/types/            # Generated GraphQL types
└── services/graphql/             # GraphQL service layer
    ├── client.ts                 # Client execution
    ├── server.ts                 # Server execution
    ├── hooks.ts                  # React hooks
    └── queries/                  # GraphQL queries
```

## 💻 Code Examples

### GraphQL Codegen Configuration

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'https://graphql.anilist.co/',
  documents: ['src/app/**/*.{ts,tsx}', 'src/services/graphql/queries/**/*.{ts,tsx}'],
  generates: {
    './src/lib/graphql/types/': {
      preset: 'client',
      config: { documentMode: 'string' }
    },
    './schema.graphql': {
      plugins: ['schema-ast']
    }
  }
}

export default config
```

### Filter Hook Example

```typescript
// src/app/(pages)/anime/_hooks/use-anime-filters.ts
import { useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"

export function useAnimeFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get filters from URL
  const genres = searchParams.get("genres")?.split(",").filter(Boolean) || []
  const year = searchParams.get("year") || ""
  const season = searchParams.get("season") || ""
  const format = searchParams.get("format") || ""
  const status = searchParams.get("status") || ""

  // Debounced filter updates (300ms)
  const updateFilters = useDebouncedCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page") // Reset pagination
      router.push(`/anime?${params.toString()}`)
    },
    300
  )

  const toggleGenre = useDebouncedCallback(
    (genre: string) => {
      const newGenres = genres.includes(genre)
        ? genres.filter((g) => g !== genre)
        : [...genres, genre]
      updateFilters("genres", newGenres.join(","))
    },
    300
  )

  return {
    genres,
    year,
    season,
    format,
    status,
    toggleGenre,
    updateFilters,
  }
}
```

### GraphQL Query Example

```typescript
// src/services/graphql/queries/popular-anime.ts
import { graphql } from '@/lib/graphql/types/gql'

export const PopularAnimeQuery = graphql(`
  query PopularAnime(
    $page: Int
    $perPage: Int
    $genres: [String]
    $format: MediaFormat
    $status: MediaStatus
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(
        type: ANIME
        sort: POPULARITY_DESC
        genre_in: $genres
        format: $format
        status: $status
        isAdult: false
      ) {
        id
        title {
          romaji
          english
          userPreferred
        }
        coverImage {
          large
          extraLarge
        }
        averageScore
        status
        genres
      }
    }
  }
`)
```

## 🔗 Links

- **Live Demo**: [orbit-eight-rosy.vercel.app](https://orbit-eight-rosy.vercel.app)
- **AniList API**: [anilist.co](https://anilist.co)
- **API Docs**: [anilist.github.io/ApiV2-GraphQL-Docs](https://anilist.github.io/ApiV2-GraphQL-Docs/)

---

**Built with ❤️ using Next.js, TypeScript, and AniList API**

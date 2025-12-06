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

## 🔗 Links

- **Live Demo**: [orbit-eight-rosy.vercel.app](https://orbit-eight-rosy.vercel.app)
- **AniList API**: [docs.anilist.co](https://docs.anilist.co/)

---
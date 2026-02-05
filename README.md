# AnimeX - Anime Discovery Platform

Modern anime browsing platform built with Next.js 16 and React 19, featuring real-time AniList API data, advanced streaming patterns, and intuitive UI.

## ✨ Features

- **Discovery**: Trending, Popular, Top Rated, Seasonal, Upcoming, Schedule, Search
- **Filtering**: Multi-select genres, year, season, format, status with URL-synced state
- **Details**: Rich media, trailers, characters, recommendations, streaming links
- **Performance**: Intelligent caching, lazy loading, optimized queries, and RSC streaming

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
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

Orbit follows a **feature-based architecture** to ensure scalability and maintainability.

```
src/
├── app/                           # Next.js App Router
│   ├── (anime)/                   # Anime feature routes
│   ├── (pages)/                   # Page-level route definitions
│   ├── api/graphql/              # GraphQL API proxy route
│   └── globals.css               # Global styles
│
├── components/                    # Shared UI components
│   ├── ui/                       # shadcn/ui primitives (Radix UI)
│   ├── shared/                   # Shared app-specific components
│   └── layout/                   # Header & Footer
│
├── features/                      # Domain-specific modules
│   ├── anime/                     # Anime discovery and details
│   │   ├── components/           # (anime-card, anime-list, filters)
│   │   └── hooks/                # (use-anime-list)
│   ├── home/                      # Homepage features
│   │   └── components/           # (upcoming-carousel, anime-section)
│   └── schedule/                  # Airing schedule features
│
├── lib/                          # Core infrastructure
│   ├── utils/                   # Shared utilities (cn, anime-utils)
│   ├── graphql/                 # GraphQL client/server/cache
│   └── providers/               # Context providers (React Query)
│
└── hooks/                        # Common React hooks
```

## ⚡ Performance Architecture

Following **Vercel's React Best Practices**, Orbit implements several high-performance patterns:

### 📡 Streaming & Parallel Fetching

The homepage leverages React Server Components (RSC) to fetch data in parallel. Each section (Trending, Seasonal, etc.) is wrapped in a `Suspense` boundary, allowing the page shell to load instantly while content "streams" in.

### 📦 Bundle Optimization

- **No Barrel Imports**: Imports are mapped directly to files to ensure optimal tree-shaking and avoid processing unnecessary modules.
- **Dynamic Imports**: Heavy client components are loaded only when needed via `next/dynamic`.

### 🧪 Modern React 19 Patterns

- **Direct Ref Passing**: Eliminated legacy `forwardRef` in favor of React 19's native `ref` prop support.
- **Hydration Safety**: Time-based elements use a "mount-only" strategy to prevent hydration mismatches between server and client.

## 🔄 Recent Updates (v2.1)

- **Cinematic Experience**: Added immersive banner headers with gradient overlays and "tactical" tech grids.
- **Interactive Trailer Component**: Bespoke YouTube integration with custom play buttons, live status indicators, and accelerated loading patterns.
- **Refined Styling**: Premium dark-mode aesthetics with glassmorphism, micro-interactions, and optimized transitions.
- **Cleanup**: Removed dead code and optimized build processes.

## 🔗 Links

- **Live Demo**: [orbit-eight-rosy.vercel.app](https://orbit-eight-rosy.vercel.app)
- **AniList API**: [docs.anilist.co](https://docs.anilist.co/)

---

## 📝 Development Notes

### UI/UX Standards

- **A11y**: Ensuring 44x44px touch targets and full keyboard navigation.
- **Motion**: Support for `prefers-reduced-motion` and optimized CSS transitions.
- **Responsiveness**: Mobile-first grid layouts with URL-synced filter state.

---

**Note**: This project follows the latest Next.js and React 19 standards. Performance and code composition are prioritized to maintain a premium user experience.

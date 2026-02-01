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
├── app/                           # Next.js App Router
│   ├── (anime)/                   # Anime feature routes
│   │   ├── anime/                # Anime list & filters
│   │   └── schedule/             # Schedule page
│   ├── api/graphql/              # GraphQL API route
 │   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
│
├── components/                    # Shared UI components
│   ├── ui/                       # shadcn/ui primitives (button, card, etc.)
│   ├── shared/                   # Shared app components
│   │   ├── error-state/
│   │   ├── loading-skeleton/
│   │   └── section-header/
│   └── layout/                   # Header & Footer
│
├── features/                      # Feature-based modules
│   ├── anime/
│   │   ├── components/           # Anime-specific components
│   │   │   ├── anime-card/
│   │   │   ├── anime-filters/
│   │   │   ├── anime-list/
│   │   │   └── anime-detail/
│   │   ├── hooks/                # Anime-specific hooks
│   │   │   ├── use-anime-filters.ts
│   │   │   └── use-anime-list.ts
│   │   └── services/             # Anime utilities
│   │
│   ├── home/
│   │   └── components/
│   │       ├── hero-carousel/
│   │       └── section/
│   │
│   └── schedule/
│       └── components/
│           ├── day-section/
│           └── schedule/
│
├── lib/                          # Core utilities
│   ├── utils/                   # General utilities (cn, anime-utils)
│   ├── constants/               # App constants (cache, API)
│   ├── graphql/                 # GraphQL infrastructure
│   │   ├── client.ts            # Client execution
│   │   ├── server.ts            # Server execution
│   │   ├── execute.ts           # Unified execution
│   │   ├── hooks.ts             # React hooks
│   │   ├── cache.ts             # Cache configuration
│   │   ├── errors.ts            # Error handling
│   │   ├── queries/             # Query definitions
│   │   └── types/               # Generated types
│   └── providers/               # App-level providers (React Query)
│
└── hooks/                        # Shared custom hooks
    ├── use-current-time.ts
    └── use-scroll-to-top.ts
```

## 🔄 Migration Status

This project has been refactored to follow a feature-based architecture. The following changes have been made:

### ✅ Completed

- Created new feature-based folder structure (`features/anime`, `features/home`, `features/schedule`)
- Moved all components from `app/_components` to appropriate feature folders
- Reorganized GraphQL services from `services/graphql` to `lib/graphql`
- Reorganized utilities into `lib/utils` and `lib/constants`
- Updated `tsconfig.json` with new path aliases (`@/features/*`, `@/components/*`, `@/lib/*`, `@/hooks/*`)
- Started updating import paths in feature components

### 🚧 In Progress

- Updating all import paths from old structure to new structure
- Removing old component folders after full migration
- Updating route components to use new paths

### Import Path Migration Guide

**Old Paths** → **New Paths**:

- `@/features/anime/components/anime-card`
- `@/features/home/components/hero-carousel`
- `@/features/home/components`
- `@/components/layout`
- `@/lib/providers`
- `@/hooks/*`
- `@/lib/graphql/*`
- `@/components/shared`
- `@/lib/utils/anime-utils`
- `@/lib/constants`

## 🔗 Links

- **Live Demo**: [orbit-eight-rosy.vercel.app](https://orbit-eight-rosy.vercel.app)
- **AniList API**: [docs.anilist.co](https://docs.anilist.co/)

---

## 📝 Development Notes

### Performance Optimizations (Planned)

- Fix barrel exports (especially lucide-react)
- Implement dynamic imports for heavy components
- Defer analytics loading to post-hydration
- Parallelize data fetching with Promise.all()

### UI/UX Improvements (Planned)

- Add comprehensive ARIA labels and roles
- Ensure all interactive elements have proper focus states
- Add support for `prefers-reduced-motion`
- Ensure 44x44px minimum touch targets

---

**Note**: This project is actively being refactored to follow Next.js and React best practices. Some import paths may still reference the old structure during the transition period.

# AnimeX - Advanced Anime Registry

Modern anime browsing platform built with Next.js 16 and React 19, featuring real-time AniList API data, advanced streaming patterns, and a "Precision Registry" aesthetic.

## ✨ Features

- **Discovery**: Trending, Popular, Top Rated, Seasonal, Upcoming, Schedule, Search
- **Filtering**: Multi-select genres, year, season, format, status with URL-synced state
- **Registry Design**: High-fidelity "Precision Registry" aesthetic with tech-inspired UI elements
- **Theming**: Full **Light & Dark Mode** support with system preference detection
- **Performance**: Intelligent caching, lazy loading, optimized queries, and RSC streaming

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (Native CSS Variables)
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

AnimeX follows a **feature-based architecture** to ensure scalability and maintainability.

```
src/
├── app/                           # Next.js App Router
│   ├── (anime)/                   # Anime feature routes
│   ├── (pages)/                   # Page-level route definitions
│   ├── api/graphql/              # GraphQL API proxy route
│   └── globals.css               # Global styles (Theming)
│
├── components/                    # Shared UI components
│   ├── ui/                       # shadcn/ui primitives
│   ├── shared/                   # Shared app-specific components
│   └── layout/                   # Header & Footer
│
├── features/                      # Domain-specific modules
│   ├── anime/                     # Anime discovery and details
│   ├── home/                      # Homepage features
│   └── schedule/                  # Airing schedule features
│
├── lib/                          # Core infrastructure
│   ├── utils/                   # Shared utilities
│   ├── graphql/                 # GraphQL client/server/cache
│   └── providers/               # Context providers
│
└── hooks/                        # Common React hooks
```

## ⚡ Performance Architecture

Following **Vercel's React Best Practices**, AnimeX implements several high-performance patterns:

### 📡 Streaming & Parallel Fetching

The homepage leverages React Server Components (RSC) to fetch data in parallel. Each section (Trending, Seasonal, etc.) is wrapped in a `Suspense` boundary, allowing the page shell to load instantly while content "streams" in.

### 📦 Bundle Optimization

- **No Barrel Imports**: Imports are mapped directly to files to ensure optimal tree-shaking and avoid processing unnecessary modules.
- **Dynamic Imports**: Heavy client components are loaded only when needed via `next/dynamic`.

### 🧪 Modern React 19 Patterns

- **Direct Ref Passing**: Eliminated legacy `forwardRef` in favor of React 19's native `ref` prop support.
- **Hydration Safety**: Time-based elements use a "mount-only" strategy to prevent hydration mismatches between server and client.

## 🔗 Links

- **Live Demo**: [orbit-eight-rosy.vercel.app](https://orbit-eight-rosy.vercel.app)
- **AniList API**: [docs.anilist.co](https://docs.anilist.co/)

---

## 📝 Design Philosophy: Precision Registry

AnimeX adopts a **"Precision Registry"** design language. This aesthetic mimics high-end technical interfaces, organizing anime data into a structured, readable, and visually immersive database.

- **Visuals**: Monospace typography, thin borders, glassmorphism, and "shimmer" loading states.
- **Interaction**: Micro-interactions, hover effects, and smooth transitions that make the database feel "alive".
- **Structure**: Grid-based layouts and clear data hierarchy.

---

**Note**: This project follows the latest Next.js and React 19 standards. Performance and code composition are prioritized to maintain a premium user experience.

# AnimeX- Anime Discovery Platform

A modern anime browsing and discovery platform built with Next.js, featuring real-time data from AniList API, advanced filtering, and an intuitive user interface.

## Features

- 🎬 **Comprehensive Anime Discovery**: 
  - Browse trending, popular, top-rated, and seasonal anime
  - Explore upcoming airing anime with interactive carousels
  - Real-time anime schedule with week view and airing countdown
  - Search functionality with instant results

- 🔍 **Advanced Filtering System**: 
  - Multi-select genre filtering with 50+ genres
  - Temporal filters: year (1940-present) and season (Winter, Spring, Summer, Fall)
  - Format filtering: TV, Movie, OVA, ONA, Special
  - Status filtering: Releasing, Finished, Not Yet Released, Cancelled
  - URL-synced filter state for shareable results
  - Debounced updates for optimal performance

- 📊 **Rich Anime Detail Pages**: 
  - High-quality banner images and cover art
  - Interactive trailers with lazy loading (click-to-play)
  - Character information with voice actors
  - Personalized recommendations
  - Related anime and franchises
  - Streaming episode information
  - External links to official sources
  - Real-time airing schedule with countdown timers

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Data Fetching**: 
  - [@tanstack/react-query](https://tanstack.com/query) for server state management
  - GraphQL with [AniList API](https://anilist.co)
- **Code Generation**: [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) for type-safe GraphQL queries
- **Carousel**: [Embla Carousel](https://www.embla-carousel.com)
- **Icons**: [Lucide React](https://lucide.dev)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Run the development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Code Generation

This project uses GraphQL Code Generator to generate TypeScript types from GraphQL queries:

```bash
# Generate types
npm run codegen

# Watch mode for development
npm run codegen:watch
```

## Project Structure

```
orbit/
├── app/                          # Next.js App Router pages
│   ├── anime/                   # Anime routes
│   │   ├── [animeId]/          # Dynamic anime detail pages
│   │   ├── layout.tsx          # Anime section layout
│   │   └── page.tsx            # Anime listing page
│   ├── api/                     # API routes
│   │   └── graphql/            # GraphQL API endpoint
│   ├── schedule/                # Anime schedule page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── features/                     # Feature-based components (domain-driven)
│   ├── anime-carousel/         # Upcoming airing anime carousel
│   ├── anime-detail/           # Anime detail page components
│   │   ├── hero.tsx            # Banner and hero section
│   │   ├── trailer.tsx         # Lazy-loaded video trailers
│   │   ├── characters.tsx      # Character list
│   │   └── ...                 # Other detail components
│   ├── anime-filters/          # Filtering UI components
│   ├── anime-list/             # Anime list with pagination
│   ├── anime-section/          # Reusable anime sections
│   ├── home/                   # Home page components
│   ├── schedule/               # Schedule page components
│   └── shared/                 # Shared feature components
│       ├── components/         # Reusable UI components
│       ├── providers/          # React Query providers
│       └── utils/              # Utility functions
├── components/                  # Shared UI components
│   └── ui/                     # shadcn/ui component library
├── hooks/                       # Custom React hooks
│   ├── use-graphql.ts          # GraphQL query hook with React Query
│   ├── use-anime-filters.ts    # Anime filter state management
│   ├── use-anime-list.ts       # Anime list logic
│   └── use-current-time.ts     # Real-time clock for schedules
├── lib/                         # Utility libraries
│   ├── graphql.ts              # GraphQL client configuration
│   ├── constants.ts            # Application constants
│   └── utils.ts                # General utilities (cn, etc.)
├── graphql/                     # GraphQL utilities
│   ├── execute.ts              # GraphQL execution logic
│   ├── graphql.ts              # Generated TypeScript types
│   └── gql.ts                  # GraphQL tag helper
├── queries/                     # GraphQL queries and fragments
│   └── media/                  # Anime-related queries
│       ├── anime-by-id.ts      # Single anime query
│       ├── trending-anime.ts   # Trending anime query
│       ├── schedule-anime.ts   # Schedule query
│       └── ...                 # Other media queries
└── schema.graphql               # GraphQL schema (for codegen)
```

## Key Features

### Advanced Filtering System
- **Multi-select Genre Filtering**: Filter by multiple genres simultaneously
- **Temporal Filters**: Year selection (1940 to present) and season filtering (Winter, Spring, Summer, Fall)
- **Format & Status**: Filter by format (TV, Movie, OVA, ONA, Special) and airing status (Releasing, Finished, Not Yet Released, Cancelled)
- **Performance Optimized**: Debounced filter updates prevent excessive API calls
- **URL-based State**: Filter state is synced with URL parameters for shareable, bookmarkable results

### Performance Optimizations
- **Intelligent Caching**: React Query with configurable stale times (5-10 minutes for different content types)
- **Request Management**: Automatic request cancellation for stale queries and request deduplication
- **Lazy Loading**: 
  - YouTube trailers load only on user interaction (saves ~600KB+ of JavaScript/CSS)
  - Code splitting for optimal bundle sizes
  - Lazy-loaded images for below-the-fold content
- **Image Optimization**: 
  - Priority loading for above-the-fold images
  - Responsive image sets with srcset
  - Proper fetchPriority and loading attributes
- **Data Efficiency**: Deduplication of anime items across queries to minimize redundant data
- **Infinite Scrolling**: Efficient "Load More" pagination with optimized query batching

## API

This project uses the [AniList GraphQL API](https://anilist.co/graphiql) for anime data.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [AniList API Documentation](hhttps://docs.anilist.co/guide/introduction)

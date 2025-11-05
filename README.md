# AnimeX- Anime Discovery Platform

A modern anime browsing and discovery platform built with Next.js, featuring real-time data from AniList API, advanced filtering, and an intuitive user interface.

## Features

- 🎬 **Anime Discovery**: Browse trending, popular, top-rated, and seasonal anime
- 🔍 **Advanced Filtering**: Filter by genres, year, season, format, and airing status
- 📱 **Responsive Design**: Fully responsive UI that works on all devices
- ⚡ **Performance Optimized**: 
  - Query caching with React Query
  - Request cancellation and deduplication
  - Infinite scrolling with "Load More"
  - Optimized image loading
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📊 **Anime Details**: Comprehensive anime detail pages with:
  - Trailers
  - Character information
  - Recommendations
  - Related anime
  - Airing schedules

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
├── app/                    # Next.js App Router pages
│   ├── anime/             # Anime listing and detail pages
│   └── page.tsx           # Home page
├── features/              # Feature-based components
│   ├── anime-carousel/    # Upcoming airing carousel
│   ├── anime-detail/      # Anime detail page components
│   ├── anime-filters/     # Filter components
│   └── anime-section/     # Anime section components
├── components/            # Shared UI components
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
│   ├── use-graphql.ts     # GraphQL query hook
│   └── use-infinite-graphql.ts  # Infinite query hook
├── graphql/               # GraphQL utilities
│   ├── execute.ts         # GraphQL execution
│   └── graphql.ts         # Generated types
└── queries/               # GraphQL queries
    └── media/             # Anime-related queries
```

## Key Features

### Filtering System
- Multi-select genre filtering
- Year selection (1940 to present)
- Season filtering (Winter, Spring, Summer, Fall)
- Format filtering (TV, Movie, OVA, ONA, Special)
- Status filtering (Releasing, Finished, etc.)
- Debounced filter updates for performance
- URL-based filter state management

### Performance Optimizations
- Query caching (5-10 minutes stale time)
- Request cancellation for stale requests
- Deduplication of anime items
- Optimized image loading with Next.js Image
- Lazy loading and code splitting

## API

This project uses the [AniList GraphQL API](https://anilist.co/graphiql) for anime data.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [AniList API Documentation](hhttps://docs.anilist.co/guide/introduction)

## License

MIT

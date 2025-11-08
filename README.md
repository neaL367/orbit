# AnimeX - Anime Discovery Platform

A modern, feature-rich anime browsing and discovery platform built with Next.js 16, featuring real-time data from AniList API, advanced filtering, and an intuitive user interface.

## ✨ Features

### 🎬 Comprehensive Anime Discovery
- **Trending Anime**: Discover what's popular right now
- **Popular Anime**: Browse all-time popular series
- **Top Rated**: Explore the highest-rated anime
- **Seasonal Anime**: Find anime by season (Winter, Spring, Summer, Fall)
- **Upcoming Airing**: Interactive carousel of upcoming episodes
- **Real-time Schedule**: Weekly anime schedule with airing countdown timers
- **Advanced Search**: Search anime by title with instant results

### 🔍 Advanced Filtering System
- **Multi-select Genre Filtering**: Filter by 50+ genres simultaneously
- **Temporal Filters**: 
  - Year selection (1940 to present)
  - Season filtering (Winter, Spring, Summer, Fall)
- **Format Filtering**: TV, Movie, OVA, ONA, Special
- **Status Filtering**: Releasing, Finished, Not Yet Released, Cancelled
- **URL-synced State**: Shareable, bookmarkable filter results
- **Performance Optimized**: Debounced updates prevent excessive API calls

### 📊 Rich Anime Detail Pages
- **High-quality Media**: Banner images and cover art
- **Interactive Trailers**: Lazy-loaded YouTube trailers (click-to-play)
- **Character Information**: Characters with voice actors and roles
- **Recommendations**: Personalized anime recommendations
- **Related Content**: Related anime and franchise connections
- **Streaming Information**: Direct links to streaming episodes
- **External Links**: Links to official sources and resources
- **Real-time Countdown**: Next episode airing countdown timers

### 🎨 Modern UI/UX
- **Dark Theme**: Beautiful dark mode interface
- **Responsive Design**: Optimized for all devices
- **Smooth Animations**: Polished transitions and interactions
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: User-friendly error messages with retry options
- **Accessibility**: ARIA labels and keyboard navigation support

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)
- **Data Fetching**: 
  - [@tanstack/react-query](https://tanstack.com/query) for server state management
  - GraphQL with [AniList API](https://anilist.co)
- **Code Generation**: [GraphQL Code Generator](https://the-guild.dev/graphql/codegen) for type-safe GraphQL queries
- **Carousel**: [Embla Carousel](https://www.embla-carousel.com)
- **Icons**: [Lucide React](https://lucide.dev)
- **Debouncing**: [use-debounce](https://github.com/xnimorz/use-debounce)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or [Bun](https://bun.sh)
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/neaL367/orbit
cd orbit

# Install dependencies
npm install
# or
bun install
```

### Code Generation

This project uses GraphQL Code Generator to generate TypeScript types from GraphQL queries:

```bash
# Generate types
bun run codegen

# Watch mode for development
bun run codegen:watch
```

### Development

```bash
# Run the development server
npm run dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 📁 Project Structure

```
orbit/
├── app/                          # Next.js App Router pages
│   ├── anime/                   # Anime routes
│   │   ├── [animeId]/          # Dynamic anime detail pages
│   │   ├── layout.tsx          # Anime section layout
│   │   └── page.tsx            # Anime listing page
│   ├── api/                     # API routes
│   │   └── graphql/            # GraphQL API endpoint (client-side proxy)
│   ├── schedule/                # Anime schedule page
│   ├── layout.tsx               # Root layout (Navbar + Footer)
│   ├── page.tsx                 # Home page
│   └── globals.css              # Global styles
├── features/                     # Feature-based components (domain-driven)
│   ├── anime-carousel/         # Upcoming airing anime carousel
│   ├── anime-detail/           # Anime detail page components
│   │   ├── anime-detail.tsx    # Main detail component
│   │   ├── anime-detail-view.tsx
│   │   ├── hero.tsx            # Banner and hero section
│   │   ├── trailer.tsx         # Lazy-loaded video trailers
│   │   ├── characters.tsx      # Character list
│   │   ├── relations.tsx       # Related anime
│   │   ├── recommendations.tsx # Recommendations
│   │   └── ...                 # Other detail components
│   ├── anime-filters/          # Filtering UI components
│   ├── anime-list/             # Anime list with pagination
│   ├── anime-section/          # Reusable anime sections
│   ├── home/                   # Home page components
│   ├── schedule/               # Schedule page components
│   └── shared/                 # Shared feature components
│       ├── components/         # Reusable UI components
│       │   ├── navbar.tsx      # Navigation bar
│       │   ├── footer.tsx      # Footer with API attribution
│       │   ├── anime-card.tsx  # Anime card component
│       │   └── ...             # Other shared components
│       ├── providers/          # React Query providers
│       └── utils/              # Utility functions
├── components/                  # Shared UI components
│   └── ui/                     # shadcn/ui component library
├── hooks/                       # Custom React hooks
│   ├── use-graphql.ts          # GraphQL query hook with React Query
│   ├── use-anime-list.ts       # Anime list logic
│   └── use-current-time.ts     # Real-time clock for schedules
├── lib/                         # Utility libraries
│   ├── graphql/                # GraphQL utilities
│   │   ├── client.ts           # Client-side execution with batching
│   │   ├── server.ts           # Server-side execution with caching
│   │   ├── cache.ts            # Cache configuration
│   │   └── errors.ts           # Error handling
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
│       ├── popular-anime.ts    # Popular anime query
│       ├── top-rated-anime.ts  # Top-rated anime query
│       ├── seasonal-anime.ts   # Seasonal anime query
│       ├── search-anime.ts     # Search query
│       ├── schedule-anime.ts   # Schedule query
│       ├── upcoming-airing-anime.ts # Upcoming airing query
│       └── README.md           # Query documentation
└── schema.graphql               # GraphQL schema (for codegen)
```

## 🎯 Key Features

### Advanced Filtering System
- **Multi-select Genre Filtering**: Filter by multiple genres simultaneously
- **Temporal Filters**: Year selection (1940 to present) and season filtering
- **Format & Status**: Filter by format and airing status
- **Performance Optimized**: Debounced filter updates prevent excessive API calls
- **URL-based State**: Filter state synced with URL parameters for shareable results

### Performance Optimizations
- **Intelligent Caching**: React Query with configurable stale times (5-10 minutes)
- **Request Management**: Automatic request cancellation and deduplication
- **GraphQL Batching**: Client-side request batching for multiple queries
- **Server-side Caching**: Next.js Data Cache with tag-based revalidation
- **Lazy Loading**: 
  - YouTube trailers load only on user interaction (saves ~600KB+)
  - Code splitting for optimal bundle sizes
  - Lazy-loaded images for below-the-fold content
- **Image Optimization**: 
  - Priority loading for above-the-fold images
  - Responsive image sets with srcset
  - Proper fetchPriority and loading attributes
- **Data Efficiency**: Deduplication of anime items across queries
- **Infinite Scrolling**: Efficient "Load More" pagination with optimized query batching

### GraphQL Architecture
- **Type-safe Queries**: Generated TypeScript types from GraphQL schema
- **Client-side Batching**: Automatic batching of multiple GraphQL requests
- **Server-side Caching**: Next.js Data Cache with intelligent cache tags
- **Error Handling**: Comprehensive error handling with retry logic
- **Query Optimization**: Removed unreliable pagination fields, optimized queries

## 📚 API

This project uses the [AniList GraphQL API](https://anilist.co/graphiql) for anime data.

### Attribution

This project is powered by the [AniList API](https://anilist.co). AniList provides comprehensive anime and manga data through their GraphQL API.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [AniList](https://anilist.co) for providing the amazing API
- [Next.js](https://nextjs.org) for the incredible framework
- [shadcn/ui](https://ui.shadcn.com) for the beautiful components
- All the open-source contributors and libraries that made this possible

## 🔗 Links

- **Live Demo**: [https://orbit-eight-rosy.vercel.app](https://orbit-eight-rosy.vercel.app)
- **GitHub Repository**: [https://github.com/neaL367/orbit.git](https://github.com/neaL367/orbit.git)
- **AniList API**: [https://anilist.co](https://anilist.co)
- **AniList API Docs**: [https://anilist.github.io/ApiV2-GraphQL-Docs/](https://anilist.github.io/ApiV2-GraphQL-Docs/)

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Query Documentation](https://tanstack.com/query/latest)
- [AniList API Documentation](https://anilist.github.io/ApiV2-GraphQL-Docs/)
- [GraphQL Best Practices](https://graphql.org/learn/best-practices/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Built with ❤️ using Next.js, TypeScript, and AniList API**

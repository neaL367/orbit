# Orbit - Anime Information Explorer

![Next.js](https://img.shields.io/badge/Next.js-15.3.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Apollo Client](https://img.shields.io/badge/Apollo%20Client-3.13.6-purple)

Orbit is a modern web application for exploring anime information, details, seasonal releases, and schedules. Built with Next.js 15.3.0, TypeScript, and powered by the AniList GraphQL API.

## Features

- **Home Page**: Discover trending, popular, and top-rated anime
- **Anime Details**: Comprehensive information about each anime
- **Seasonal Anime**: Browse anime by season and year
- **Schedule**: Weekly anime airing schedule
- **Search**: Find anime by title, genre, and more
- **Responsive Design**: Optimized for all device sizes

## Tech Stack

- **Framework**: [Next.js 15.3.0](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **API Client**: [Apollo Client](https://www.apollographql.com/docs/react/)
- **GraphQL API**: [AniList API](https://anilist.gitbook.io/anilist-apiv2-docs/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) with custom styling
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/orbit.git
cd orbit
```

2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Start the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (pages)/          # Route groups for pages
│   ├── graphql/          # GraphQL queries and fragments
│   ├── error.tsx         # Global error handling
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # Reusable components
│   ├── anime/            # Anime-specific components
│   ├── schedule/         # Schedule-related components
│   ├── seasonal/         # Seasonal anime components
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and types
│   ├── apollo-client.ts  # Apollo Client configuration
│   ├── apollo-types.ts   # Apollo-specific type definitions
│   ├── image-utils.ts    # Image optimization utilities
│   ├── types.ts          # TypeScript interfaces
│   └── utils.ts          # General utility functions
```

## Custom Hooks

- `usePaginatedQuery`: Handles paginated GraphQL queries with infinite scrolling
- `useErrorHandler`: Manages error states, including rate limiting

## Performance Optimizations

- Image optimization with Next.js Image and custom utilities
- Apollo Client cache configuration for efficient data fetching
- Code splitting and lazy loading
- Optimized bundle size with package imports optimization

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [AniList](https://anilist.co/) for providing the GraphQL API
- [Next.js](https://nextjs.org/) team for the amazing framework
- [Radix UI](https://www.radix-ui.com/) for accessible UI components


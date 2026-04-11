/**
 * Central export for all GraphQL queries.
 * Provides a simple gql tag for codegen discovery.
 */

export const gql = (s: TemplateStringsArray) => s.join('');

export * from './anime-by-id';
export * from './trending-anime';
export * from './popular-anime';
export * from './top-rated-anime';
export * from './seasonal-anime';
export * from './search-anime';
export * from './upcoming-airing-anime';
export * from './schedule-anime';

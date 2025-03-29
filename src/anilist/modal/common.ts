// GraphQL value types
export type GraphQLScalarValue = string | number | boolean | null | undefined
export type GraphQLObjectValue = { [key: string]: GraphQLValue }
export type GraphQLValue = GraphQLScalarValue | GraphQLObjectValue | GraphQLValue[]

// Common GraphQL error extension properties
export interface GraphQLErrorExtensions {
  code?: string
  timestamp?: string
  path?: string
  exception?: {
    stacktrace?: string[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

// GraphQL error interface
export interface GraphQLError {
  message: string
  locations?: { line: number; column: number }[]
  path?: string[]
  extensions?: GraphQLErrorExtensions
}

// AniList API response interface
export interface AnilistResponse<T> {
  data?: T
  errors?: GraphQLError[]
}

// GraphQL variables type
export type GraphQLVariables = Record<string, GraphQLValue>

// Pagination info interface
export interface PageInfo {
  total: number
  currentPage: number
  lastPage: number
  hasNextPage: boolean
  perPage: number
}

// Date information interface
export interface DateInfo {
  year: number | null
  month: number | null
  day: number | null
}


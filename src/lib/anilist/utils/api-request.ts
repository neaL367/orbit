import type { AnilistResponse } from "@/lib/anilist/utils/types"

const ANILIST_API = "https://graphql.anilist.co" as const

// Define a recursive type for GraphQL variables
export type GraphQLScalarValue = string | number | boolean | null | undefined
export type GraphQLObjectValue = { [key: string]: GraphQLValue }
export type GraphQLValue = GraphQLScalarValue | GraphQLObjectValue | GraphQLValue[]

// Define the final GraphQL variables type with index signature
export type GraphQLVariables = Record<string, GraphQLValue>

export async function apiRequest<T>(
  query: string,
  variables: GraphQLVariables = {},
  options: RequestInit = {},
): Promise<AnilistResponse<T>> {
  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 3600 },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json() as AnilistResponse<T>

    if (!data?.data) {
      throw new Error("Invalid API response")
    }

    return data
  } catch (error) {
    console.error("AniList API request failed:", error)
    throw error
  }
}
// lib/apiRequest.ts
import type { AnilistResponse, GraphQLVariables } from "@/anilist/modal/common";

const ANILIST_API = "https://graphql.anilist.co" as const;

export async function apiRequest<T>(
  query: string,
  variables: GraphQLVariables = {},
  options: RequestInit = {},
  retryCount = 0
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
    });

    const data = (await response.json()) as AnilistResponse<T>;
    return data;
  } catch (err) {
    if (retryCount < 3) {
      return apiRequest(query, variables, options, retryCount + 1);
    }
    throw err;
  }
}

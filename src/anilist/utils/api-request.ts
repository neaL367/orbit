// lib/apiRequest.ts
import type { AnilistResponse, GraphQLVariables } from "@/anilist/modal/common";

const ANILIST_API = "https://graphql.anilist.co" as const;

export async function apiRequest<T>(
  query: string,
  variables: GraphQLVariables = {},
  options: RequestInit = {},
  retryCount = 0
): Promise<AnilistResponse<T>> {
  const MAX_RETRIES = 3;

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

    // If the response is not OK, handle 429 specifically
    if (!response.ok) {
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After")) || 30;
        console.warn(`Rate limit hit. Retrying after ${retryAfter} seconds...`);
        if (retryCount < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
          return apiRequest(query, variables, options, retryCount + 1);
        }
      }
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = (await response.json()) as AnilistResponse<T>;

    // Check if AniList returned GraphQL errors
    if (data.errors && data.errors.length > 0) {
      const errorInfo = data.errors[0];
      if (errorInfo.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After")) || 30;
        console.warn(`Rate limit hit: ${errorInfo.message}. Retrying after ${retryAfter} seconds...`);
        if (retryCount < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
          return apiRequest(query, variables, options, retryCount + 1);
        }
      }
      throw new Error(errorInfo.message || "AniList error occurred.");
    }

    return data;
  } catch (err) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`Error encountered. Retrying request (${retryCount + 1}/${MAX_RETRIES})...`);
      return apiRequest(query, variables, options, retryCount + 1);
    }
    throw err;
  }
}

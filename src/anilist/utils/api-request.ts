import { AnilistResponse, GraphQLVariables } from "../modal/common";

const ANILIST_API = "https://graphql.anilist.co" as const


export async function apiRequest<T>(
  query: string,
  variables: GraphQLVariables = {},
  options: RequestInit = {},
  retries: number = 3,
  backoff: number = 500 // starting backoff in ms
): Promise<AnilistResponse<T>> {
  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
      // Next.js specific revalidation configuration
      next: { revalidate: 3600 },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AnilistResponse<T>;
    if (!data?.data) {
      throw new Error("Invalid API response");
    }

    return data;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Request failed. Retrying in ${backoff}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, backoff));
      // Increase backoff delay for next retry
      return apiRequest(query, variables, options, retries - 1, backoff * 2);
    }
    console.error("AniList API request failed:", error);
    throw error;
  }
}

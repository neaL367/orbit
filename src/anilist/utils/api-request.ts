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
      next: { revalidate: 3600 },
      ...options,
    });

    if (response.status === 429) {
      // Get the suggested retry delay or default to 60 seconds.
      const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
      console.warn(`Rate limit reached. Waiting ${retryAfter} seconds before retrying...`);
      // Wait for the retry delay
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      // Throw an error to trigger our retry logic
      throw new Error("Rate limit exceeded");
    }

    if (!response.ok) {
      throw new Error(`AniList API error: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as AnilistResponse<T>;
    return data;
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, backoff));
      return apiRequest(query, variables, options, retries - 1, backoff * 2);
    }
    throw error;
  }
}

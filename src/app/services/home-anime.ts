import { AiringSchedule } from "@/lib/types";
import { getAiringAnime } from "./airing-anime";
import { getAllTimePopularAnime } from "./all-time-popular";
import { getTopRatedAnime } from "./top-rated-anime";
import { getTrendingAnime } from "./trending-anime";

// Create a function that fetches all required data in a single Promise.all call
export async function getHomefetch(page = 1, perPage = 6) {
    try {
        // Use Promise.all to run all queries in parallel
        const [trendingData, popularData, topRatedData, airingData] = await Promise.all([
            getTrendingAnime(page, perPage),
            getAllTimePopularAnime(page, perPage),
            getTopRatedAnime(page, perPage),
            getAiringAnime(page, perPage, true)
        ]);

        // Process the airing schedules to get upcoming premieres
        const upcomingPremieres = airingData.schedules
            .filter((schedule: AiringSchedule) => schedule.episode === 1)
            .slice(0, perPage);

        // Return all the data in a structured object
        return {
            trending: trendingData.media,
            popular: popularData.media,
            topRated: topRatedData.media,
            upcomingPremieres
        };
    } catch (error) {
        console.error("Error fetching home page data:", error);
        // Return empty arrays as fallback
        return {
            trending: [],
            popular: [],
            topRated: [],
            upcomingPremieres: []
        };
    }
}
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimeGrid } from "@/components/anime-grid";
// import { ScheduleDay } from "@/components/schedule-day";
import { getAllAnime } from "@/lib/db";
// import { getSchedule, getDayOfWeek } from "@/lib/db";

export default async function Home() {
  // Get featured anime (latest 10)
  const allAnime = await getAllAnime();
  const featuredAnime = allAnime.slice(0, 10);

  // Get today's schedule
  // const today = getDayOfWeek();
  // const todaySchedule = await getSchedule(today);

  return (
    <div className="container h-full py-8 space-y-12">
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Featured</h2>
          <Button asChild variant="ghost">
            <Link href="/anime">View All</Link>
          </Button>
        </div>
        <AnimeGrid animeList={featuredAnime} />
      </section>
      {/* <hr className="h-px my-8 bg-gray-200 border-0 dark:bg-gray-700" /> */}
      {/* <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold">Today&apos;s Schedule</h2>
          <Button asChild variant="ghost">
            <Link href="/schedule">Full Schedule</Link>
          </Button>
        </div>
        <ScheduleDay day={today} animeList={todaySchedule} />
      </section> */}
    </div>
  );
}

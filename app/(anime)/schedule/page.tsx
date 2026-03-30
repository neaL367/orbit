import { Suspense } from "react"
import { Schedule } from "@/features/schedule/components/schedule/schedule"
import { NextAiring } from "@/features/home/components/next-airing"
import { getScheduleAnime } from "@/lib/graphql/data"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Transmission Schedule — Registry",
    description: "Temporal registry of upcoming animation broadcasts. Synchronized in real-time.",
    alternates: {
        canonical: '/schedule',
    },
}


export default async function SchedulePage() {
    const scheduleData = await getScheduleAnime(1, 5)

    return (
        <div className="space-y-12">
            <Suspense fallback={<div className="h-[70dvh] md:h-[85dvh] bg-secondary/5 shimmer" />}>
                <NextAiring className="h-[70dvh] md:h-[85dvh]" initialData={scheduleData} />
            </Suspense>
            <Schedule />
        </div>
    )
}

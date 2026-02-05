import { Schedule } from "@/features/schedule/components/schedule/schedule"
import { NextAiring } from "@/features/home/components/next-airing"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Transmission Schedule — Registry",
    description: "Temporal registry of upcoming animation broadcasts. Synchronized in real-time.",
}

export default function SchedulePage() {
    return (
        <div className="space-y-12">
            <NextAiring />
            <Schedule />
        </div>
    )
}

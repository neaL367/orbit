import { Suspense } from "react"
import { Schedule } from "@/features/schedule/components/schedule/schedule"
import { NextAiring } from "@/features/home/components/next-airing"
import { Container } from "@/components/shared/container"
import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Transmission Schedule — Registry",
    description: "Temporal registry of upcoming animation broadcasts. Synchronized in real-time.",
    alternates: {
        canonical: '/schedule',
    },
}


export default async function SchedulePage() {
    return (
        <div className="space-y-40">
            <Suspense fallback={<div className="h-[70dvh] md:h-[85dvh] bg-secondary/5 shimmer" />}>
                <NextAiring className="h-[70dvh] md:h-[85dvh]" />
            </Suspense>
            
            <Container>
                <Schedule />
            </Container>
        </div>
    )
}

import { Suspense } from "react"
import { Schedule } from "@/features/schedule/components/schedule/schedule"
import { ScheduleLoading } from "@/features/schedule/components/schedule/loading"
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
        <div className="py-10 md:py-14">
            <Container>
                <Suspense fallback={<ScheduleLoading />}>
                    <Schedule />
                </Suspense>
            </Container>
        </div>
    )
}

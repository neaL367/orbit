import { Suspense } from "react";
import ScheduleSkeleton from "../../../components/schedule/schedule-skeleton";
import ScheduleContent from "@/components/schedule/schedule-content";

export default function SchedulePage() {
  return (
    <main className="py-8">
      {/* <h1 className="text-3xl font-bold mb-6">Anime Schedule</h1> */}

      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleContent />
      </Suspense>
    </main>
  );
}

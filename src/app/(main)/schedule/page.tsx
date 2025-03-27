import { Suspense } from "react";
import ScheduleSkeleton from "../../../components/schedule/schedule-skeleton";
import ScheduleContent from "@/components/schedule/schedule-content";

export default function SchedulePage() {
  return (
    <main className="mt-24 mb-24">
      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleContent />
      </Suspense>
    </main>
  );
}

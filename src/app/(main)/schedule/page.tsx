import { Suspense } from "react";
import ScheduleSkeleton from "../../../components/schedule/schedule-skeleton";
import ScheduleContent from "@/components/schedule/schedule-content";

export default function SchedulePage() {
  return (
    <div className="">
      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleContent />
      </Suspense>
    </div>
  );
}

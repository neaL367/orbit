import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WeekNavigationProps {
  weekStart: Date;
  weekEnd: Date;
  weekOffset: number;
  setWeekOffset: (offset: number) => void;
}

export function WeekNavigation({
  weekStart,
  weekEnd,
  weekOffset,
  setWeekOffset,
}: WeekNavigationProps) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-5 lg:justify-between mb-6">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-medium">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </h2>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(weekOffset - 1)}
          className="rounded-full"
        >
          Previous Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(0)}
          disabled={weekOffset === 0}
          className="rounded-full"
        >
          Current Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setWeekOffset(weekOffset + 1)}
          className="rounded-full"
        >
          Next Week
        </Button>
      </div>
    </div>
  );
}
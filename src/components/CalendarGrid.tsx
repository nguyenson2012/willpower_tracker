import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isBefore,
  startOfDay,
} from "date-fns";
import { Flame } from "lucide-react";
import { DailyEntry } from "@/hooks/useEntries";
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  currentMonth: Date;
  entries: DailyEntry[];
  onDayClick: (date: Date) => void;
  loading: boolean;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarGrid = ({ currentMonth, entries, onDayClick, loading }: CalendarGridProps) => {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const completedSet = new Set(
    entries.filter((e) => e.completed).map((e) => e.entry_date)
  );

  return (
    <div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-[10px] sm:text-xs font-medium text-muted-foreground py-1"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const completed = completedSet.has(dateStr);
          const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
          const isFuture = !isPast && !today;
          const missed = inMonth && isPast && !completed && !today;
          const canClick = inMonth && today;

          return (
            <button
              key={dateStr}
              onClick={() => canClick && onDayClick(day)}
              disabled={!canClick}
              className={cn(
                "h-8 sm:h-10 w-full rounded-lg flex flex-col items-center justify-center text-sm font-medium transition-all duration-200 relative",
                !inMonth && "text-muted-foreground/30 cursor-default",
                inMonth && !canClick && "cursor-not-allowed opacity-60",
                canClick && "hover:bg-accent cursor-pointer",
                today && !completed && "ring-2 ring-primary ring-offset-2 ring-offset-background",
                completed && "bg-completed text-completed-foreground hover:bg-completed/90 shadow-sm",
                missed && "bg-missed/15 text-missed",
              )}
            >
              <span>{format(day, "d")}</span>
              {completed && (
                <Flame className="w-2.5 h-2.5 fill-current text-orange-400 animate-in zoom-in duration-300" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;

import { Card } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

const StreakDisplay = ({ currentStreak, longestStreak }: StreakDisplayProps) => {
  const handleShare = async () => {
    const shareData = {
      title: "Willpower Tracker",
      text: `I've reached a ${currentStreak}-day streak on Willpower Tracker! 🔥 Join me in building discipline.`,
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success("Successfully shared!");
      } else {
        await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
        toast.success("Link copied to clipboard!");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") {
        toast.error("Could not share streak");
      }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="p-3 sm:p-4 text-center border-border/50 bg-card relative overflow-hidden">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-7 w-7 text-muted-foreground hover:text-primary"
          onClick={handleShare}
          title="Share streak"
        >
          <Share2 className="h-3.5 w-3.5" />
        </Button>
        <div className="text-2xl mb-1 mt-1">
          {currentStreak > 0 ? (
            <span className="animate-flame-pulse inline-block">🔥</span>
          ) : (
            "💤"
          )}
        </div>
        <div className="text-xl sm:text-2xl font-bold font-display text-foreground">
          {currentStreak}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Current Streak
        </div>
      </Card>

      <Card className="p-3 sm:p-4 text-center border-border/50 bg-card">
        <div className="text-2xl mb-1">🏆</div>
        <div className="text-xl sm:text-2xl font-bold font-display text-foreground">
          {longestStreak}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Longest Streak
        </div>
      </Card>
    </div>
  );
};

export default StreakDisplay;

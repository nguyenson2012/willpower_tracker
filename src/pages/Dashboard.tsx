import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useEntries } from "@/hooks/useEntries";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, LogOut, Crown, Settings, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CalendarGrid from "@/components/CalendarGrid";
import DayModal from "@/components/DayModal";
import StreakDisplay from "@/components/StreakDisplay";
import InspirationQuote from "@/components/InspirationQuote";
import SuccessJar from "@/components/SuccessJar";
import VideoList from "@/components/VideoList";
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  subMonths,
} from "date-fns";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const { isAdmin, profile } = useUserProfile();
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const { entries, allEntries, loading, upsertEntry } = useEntries(monthStart, monthEnd);

  const { currentStreak, longestStreak } = useMemo(() => {
    if (!allEntries.length) return { currentStreak: 0, longestStreak: 0 };

    const completedDates = allEntries
      .filter((e) => e.completed)
      .map((e) => e.entry_date)
      .sort()
      .reverse();

    if (!completedDates.length) return { currentStreak: 0, longestStreak: 0 };

    // Calculate current streak from today backwards
    const today = format(new Date(), "yyyy-MM-dd");
    let current = 0;
    const checkDate = new Date();

    for (let i = 0; i < 365; i++) {
      const dateStr = format(checkDate, "yyyy-MM-dd");
      if (completedDates.includes(dateStr)) {
        current++;
      } else if (dateStr !== today) {
        break;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Longest streak
    let longest = 0;
    let streak = 0;
    const allSorted = [...completedDates].sort();
    for (let i = 0; i < allSorted.length; i++) {
      if (i === 0) {
        streak = 1;
      } else {
        const prev = new Date(allSorted[i - 1]);
        const curr = new Date(allSorted[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        streak = diff === 1 ? streak + 1 : 1;
      }
      longest = Math.max(longest, streak);
    }

    return { currentStreak: current, longestStreak: longest };
  }, [allEntries]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-flame-pulse">🔥</span>
            <h1 className="text-xl font-bold font-display text-foreground">Willpower Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate('/admin/videos')}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Manage Videos</span>
                </Button>
                <div className="flex items-center gap-1 px-2 py-1 bg-amber-100 dark:bg-amber-900/20 rounded-md">
                  <Crown className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Admin</span>
                </div>
              </>
            )}
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent/50 transition-all duration-200 cursor-pointer group"
              title="Edit Profile"
            >
              <Avatar className="h-7 w-7 border border-border/50 group-hover:border-primary/50 transition-colors duration-200">
                <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
                <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
                  {profile?.username
                    ? profile.username.slice(0, 2).toUpperCase()
                    : user?.email?.slice(0, 2).toUpperCase() || "??"}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground hidden sm:block group-hover:text-foreground transition-colors duration-200">
                {profile?.username || user?.email?.split("@")[0]}
              </span>
            </button>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 max-w-7xl">
        <StreakDisplay currentStreak={currentStreak} longestStreak={longestStreak} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-start">
          {/* Left Sidebar */}
          <div className="order-3 lg:order-1 lg:col-span-3 space-y-6">
            <SuccessJar />

            {/* Quick Stats */}
            <div className="hidden md:block bg-card rounded-lg border p-4 h-[150px]">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">📊</span>
                Quick Stats
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">This Month:</span>
                  <span className="font-medium">
                    {entries.filter(e => e.completed).length} / {new Date().getDate()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success Rate:</span>
                  <span className="font-medium">
                    {entries.length > 0 ? Math.round((entries.filter(e => e.completed).length / entries.length) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Best Streak:</span>
                  <span className="font-medium">{longestStreak} days</span>
                </div>
              </div>
            </div>

            {/* Today's Focus */}
            <div className="hidden md:block bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Today's Focus
              </h3>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Stay consistent with your daily discipline practice.</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Keep going strong!</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Calendar */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h2 className="text-2xl font-bold font-display text-foreground">
                {format(currentMonth, "MMMM yyyy")}
              </h2>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <CalendarGrid
              currentMonth={currentMonth}
              entries={entries}
              onDayClick={setSelectedDate}
              loading={loading}
            />

            <div className="mt-6">
              <InspirationQuote />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="order-2 lg:order-3 lg:col-span-3 space-y-6">
            <VideoList />

            {/* Recent Activity */}
            <div className="hidden md:block bg-card rounded-lg border p-4 h-[150px]">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">⚡</span>
                Recent Activity
              </h3>
              <div className="space-y-2">
                {allEntries
                  .filter(e => e.completed)
                  .sort((a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime())
                  .slice(0, 2)
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
                      <span className="text-muted-foreground">
                        {format(new Date(entry.entry_date), "MMM d")}
                      </span>
                      {entry.notes && (
                        <span className="text-xs text-muted-foreground truncate">
                          - {entry.notes}
                        </span>
                      )}
                    </div>
                  ))}
                {allEntries.filter(e => e.completed).length === 0 && (
                  <p className="text-sm text-muted-foreground">No completed entries yet</p>
                )}
              </div>
            </div>

            {/* Motivation Corner */}
            <div className="hidden md:block bg-card rounded-lg border p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <span className="text-lg">💪</span>
                Keep Going!
              </h3>
              <div className="text-sm text-muted-foreground">
                {currentStreak > 0 ? (
                  <p>Amazing! You're on a {currentStreak}-day streak. Every day counts towards building lasting habits.</p>
                ) : (
                  <p>Today is a perfect day to start fresh. Small consistent actions lead to big changes!</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {
          selectedDate && (
            <DayModal
              date={selectedDate}
              entry={entries.find((e) => e.entry_date === format(selectedDate, "yyyy-MM-dd"))}
              allEntries={allEntries}
              onClose={() => setSelectedDate(null)}
              onSave={upsertEntry}
            />
          )
        }
      </main >
    </div >
  );
};

export default Dashboard;

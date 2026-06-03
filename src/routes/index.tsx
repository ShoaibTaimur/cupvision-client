import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { api, Match } from "@/lib/api";
import { MatchCard, LiveMatchCard } from "@/components/match-card";
import { Skeleton } from "@/components/skeleton";
import { Activity, CalendarClock, ChevronRight, Trophy, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CupVision — FIFA World Cup 2026 Tracker" },
      { name: "description", content: "Live matches, scoreboard and team statistics for the 2026 World Cup." },
      { property: "og:title", content: "CupVision — FIFA World Cup 2026 Tracker" },
      { property: "og:description", content: "Live matches, scoreboard and team statistics for the 2026 World Cup." },
    ],
  }),
  component: Home,
});

function useCountdown(target?: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

function Home() {
  const matches = useQuery({
    queryKey: ["matches"],
    queryFn: () => api.get<Match[]>("/api/matches"),
  });
  const stats = useQuery({
    queryKey: ["stats", "tournament"],
    queryFn: () => api.get<any>("/api/stats/tournament"),
  });

  const list = matches.data || [];
  const live = list.find((m) => m.status === "live");
  const upcoming = list
    .filter((m) => m.status === "scheduled")
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];
  const recent = list
    .filter((m) => m.status === "completed")
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`))
    .slice(0, 6);

  const cd = useCountdown(upcoming ? `${upcoming.date}T${upcoming.time}:00` : undefined);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
          <span className="inline-block px-3 py-1 rounded-full text-xs bg-primary/15 text-primary border border-primary/30 mb-4">
            FIFA World Cup 2026
          </span>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
            Track. <span className="text-primary">Analyze.</span> Follow.
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            Every match, every team, every result — the unofficial companion to the 2026
            World Cup. Live status, group standings and a full chronological timeline.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/matches" className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors">
              Browse matches <ChevronRight className="size-4" />
            </Link>
            <Link to="/scoreboard" className="inline-flex items-center gap-1.5 border border-border rounded-md px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors">
              View scoreboard
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 grid lg:grid-cols-2 gap-6">
        {/* Live */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="size-4 text-accent" />
            <h2 className="font-semibold">Live match</h2>
          </div>
          {matches.isLoading ? (
            <Skeleton className="h-28" />
          ) : live ? (
            <LiveMatchCard m={live} />
          ) : (
            <p className="text-sm text-muted-foreground">No matches live right now.</p>
          )}
        </div>

        {/* Upcoming countdown */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarClock className="size-4 text-primary" />
            <h2 className="font-semibold">Next match</h2>
          </div>
          {matches.isLoading ? (
            <Skeleton className="h-28" />
          ) : upcoming ? (
            <div>
              <div className="text-sm text-muted-foreground">
                {upcoming.homeTeam?.name} <span className="opacity-70">vs</span> {upcoming.awayTeam?.name}
              </div>
              <div className="text-xs text-muted-foreground mb-3">
                {upcoming.date} · {upcoming.time} · {upcoming.stadium}
              </div>
              {cd ? (
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    ["Days", cd.days],
                    ["Hrs", cd.hours],
                    ["Min", cd.minutes],
                    ["Sec", cd.seconds],
                  ].map(([l, v]) => (
                    <div key={l as string} className="bg-secondary rounded-md py-2">
                      <div className="text-2xl font-bold tabular-nums">{String(v).padStart(2, "0")}</div>
                      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{l}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Starting any moment.</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming match scheduled.</p>
          )}
        </div>
      </div>

      {/* Tournament stats */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(
            [
              { label: "Total matches", value: stats.data?.totalMatches, icon: Trophy },
              { label: "Completed", value: stats.data?.completed, icon: Trophy },
              { label: "Upcoming", value: stats.data?.upcoming, icon: CalendarClock },
              { label: "Teams", value: stats.data?.teamsCount, icon: Users },
              { label: "Goals scored", value: stats.data?.goals, icon: Activity },
            ] as const
          ).map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between text-muted-foreground text-xs">
                <span>{s.label}</span>
                <s.icon className="size-4" />
              </div>
              <div className="text-2xl font-bold mt-1 tabular-nums">
                {stats.isLoading ? "—" : s.value ?? 0}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent results */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent results</h2>
          <Link to="/timeline" className="text-sm text-primary hover:underline">View timeline</Link>
        </div>
        {matches.isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : recent.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.map((m) => <MatchCard key={m._id} m={m} />)}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No completed matches yet.</p>
        )}
      </section>
    </div>
  );
}

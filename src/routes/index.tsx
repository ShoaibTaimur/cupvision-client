import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { api, Channel, HomeSummary } from "@/lib/api";
import { MatchCard, LiveMatchCard } from "@/components/match-card";
import { SectionReveal } from "@/components/section-reveal";
import { Skeleton, MatchCardSkeleton } from "@/components/skeleton";
import {
  Activity,
  CalendarClock,
  ChevronRight,
  PlayCircle,
  Radio,
  Trophy,
  Users,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/date";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CupVision — FIFA World Cup 2026 Tracker" },
      {
        name: "description",
        content: "Live matches, scoreboard and team statistics for the 2026 World Cup.",
      },
      { property: "og:title", content: "CupVision — FIFA World Cup 2026 Tracker" },
      {
        property: "og:description",
        content: "Live matches, scoreboard and team statistics for the 2026 World Cup.",
      },
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
  const qc = useQueryClient();
  // Single lightweight summary call — no polling. Live scores are handled
  // separately on /matches and /scoreboard so home stays cheap.
  const summary = useQuery({
    queryKey: ["home", "summary"],
    queryFn: () => api.get<HomeSummary>("/api/matches/home-summary"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const stats = useQuery({
    queryKey: ["stats", "tournament"],
    queryFn: () => api.get<any>("/api/stats/tournament"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const channels = useQuery({
    queryKey: ["channels"],
    queryFn: () => api.get<Channel[]>("/api/channels"),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const featuredChannel =
    (channels.data || []).find((item) => item.isFeatured) || channels.data?.[0];
  const live = summary.data?.live || null;
  const upcoming = summary.data?.upcoming || null;
  const recent = summary.data?.recent || [];

  const cd = useCountdown(upcoming ? `${upcoming.date}T${upcoming.time}:00` : undefined);

  // When the upcoming countdown reaches zero, refetch summary so the server
  // can auto-promote the match from "scheduled" to "live".
  const promotedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!upcoming) return;
    if (cd === null && promotedRef.current !== upcoming._id) {
      promotedRef.current = upcoming._id;
      qc.invalidateQueries({ queryKey: ["home", "summary"] });
    }
  }, [cd, upcoming, qc]);



  return (
    <div>
      {/* Hero */}
      <SectionReveal
        delay={0.05}
        className="relative isolate flex min-h-screen items-center overflow-hidden border-b border-border/70"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(117,197,255,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(83,214,168,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:72px_72px] opacity-20" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32 md:pt-36 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-primary backdrop-blur">
              <Radio className="size-3.5" />
              FIFA World Cup 2026
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl md:text-6xl xl:text-7xl">
              Tournament pulse.
              <span className="block bg-[linear-gradient(135deg,#f7fbff_0%,#8ddcff_38%,#73f0c1_100%)] bg-clip-text text-transparent">
                One sharp live board.
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Live match status, countdowns, scoreboard, squads, watch links, timeline. Fast scan.
              Strong signal. No clutter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/matches"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_rgba(117,197,255,0.24)] transition hover:bg-primary/90"
              >
                Browse matches <ChevronRight className="size-4" />
              </Link>
              <Link
                to="/scoreboard"
                className="inline-flex items-center gap-1.5 rounded-2xl border border-white/12 bg-white/6 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/10"
              >
                View scoreboard
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                { label: "Live now", value: live ? "01" : "00" },
                { label: "Channels", value: String(channels.data?.length ?? 0).padStart(2, "0") },
                { label: "Upcoming", value: String(stats.data?.upcoming ?? 0).padStart(2, "0") },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-3xl border border-white/10 bg-white/6 px-4 py-4 backdrop-blur"
                >
                  <div className="text-2xl font-black tabular-nums text-white">{item.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.22em] text-slate-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-6 top-8 h-24 w-24 rounded-full border border-white/10 bg-white/8 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                    Next kickoff
                  </div>
                  <div className="mt-3 text-2xl font-black tracking-tight text-white">
                    {upcoming
                      ? `${upcoming.homeTeam?.name} vs ${upcoming.awayTeam?.name}`
                      : "Schedule pending"}
                  </div>
                </div>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/18 text-primary">
                  <Trophy className="size-6" />
                </div>
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-4">
                <div className="flex items-center justify-between gap-4 text-sm text-slate-300">
                  <span>{upcoming?.stadium || "Venue TBA"}</span>
                  <span>
                    {upcoming
                      ? `${formatDate(upcoming.date)} · ${formatTime(upcoming.time)}`
                      : "Awaiting update"}
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {cd
                    ? [
                        ["D", cd.days],
                        ["H", cd.hours],
                        ["M", cd.minutes],
                        ["S", cd.seconds],
                      ].map(([label, value]) => (
                        <div
                          key={label as string}
                          className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-center"
                        >
                          <div className="text-2xl font-black tabular-nums text-white">
                            {String(value).padStart(2, "0")}
                          </div>
                          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {label}
                          </div>
                        </div>
                      ))
                    : ["D", "H", "M", "S"].map((label) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-white/6 px-3 py-3 text-center"
                        >
                          <div className="text-2xl font-black tabular-nums text-white">--</div>
                          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                            {label}
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Featured stream
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {featuredChannel?.name || "No featured channel"}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-300">
                    {featuredChannel?.badge || "Global feed"}
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Live status
                  </div>
                  <div className="mt-2 text-sm font-semibold text-white">
                    {live ? "Match running now" : "No live fixture"}
                  </div>
                  <div className="mt-1 text-sm leading-6 text-slate-300">
                    {live
                      ? `${live.homeTeam?.name} vs ${live.awayTeam?.name}`
                      : "Stand by for kickoff"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.12} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Link
            to="/watch"
            className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.16)] transition hover:border-primary/30 sm:p-7"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(117,197,255,0.12),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_55%)]" />
            <div className="relative flex h-full flex-col justify-between gap-6">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                  <Radio className="size-3.5" />
                  Watch center
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  {featuredChannel
                    ? `${featuredChannel.name} leads live viewing.`
                    : "Live channels, one quick watch flow."}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  {featuredChannel?.description ||
                    "Open featured stream fast, switch feeds fast, keep live coverage inside one clean surface."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 font-semibold text-foreground">
                  <PlayCircle className="size-4 text-primary" />
                  Watch now
                </div>
                <div className="rounded-2xl border border-border/70 bg-background/50 px-4 py-3 text-muted-foreground">
                  {featuredChannel?.badge || "Global feed"}
                </div>
              </div>
            </div>
          </Link>

          <div className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.14)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              <Activity className="size-4 text-primary" />
              Live snapshot
            </div>
            <div className="mt-5">
              {summary.isLoading ? (
                <Skeleton className="h-40 rounded-[1.5rem]" />
              ) : live ? (
                <LiveMatchCard m={live} />
              ) : (
                <div className="rounded-[1.5rem] border border-border/70 bg-background/60 p-5">
                  <div className="text-lg font-semibold text-foreground">No live match now</div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Next fixtures, recent results, watch channels still ready below.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.18} className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {(
            [
              { label: "Total matches", value: stats.data?.totalMatches, icon: Trophy },
              { label: "Completed", value: stats.data?.completed, icon: Trophy },
              { label: "Upcoming", value: stats.data?.upcoming, icon: CalendarClock },
              { label: "Teams", value: stats.data?.teamsCount, icon: Users },
              { label: "Goals scored", value: stats.data?.goals, icon: Activity },
            ] as const
          ).map((s) => (
            <div
              key={s.label}
              className="rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] p-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)]"
            >
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{s.label}</span>
                <s.icon className="size-4" />
              </div>
              <div className="mt-2 text-2xl font-black tabular-nums text-foreground">
                {stats.isLoading ? "—" : (s.value ?? 0)}
              </div>
            </div>
          ))}
        </div>
      </SectionReveal>

      {/* Recent results */}
      <SectionReveal delay={0.24} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">
              Archive
            </div>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-foreground">
              Recent results
            </h2>
          </div>
          <Link to="/timeline" className="text-sm text-primary hover:underline">
            View timeline
          </Link>
        </div>
        {summary.isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <MatchCardSkeleton key={i} />
            ))}
          </div>
        ) : recent.length ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.map((m) => (
              <MatchCard key={m._id} m={m} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No completed matches yet.</p>
        )}
      </SectionReveal>
    </div>
  );
}

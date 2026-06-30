import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin-shell";
import { api, Match } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
import { TeamFlag, StatusBadge } from "@/components/match-card";
import { formatMatchDate, formatMatchTime } from "@/lib/date";
import {
  Trophy,
  Calendar,
  GitBranch,
  Radio,
  Users,
  Upload,
  ChevronRight,
  Activity,
  ArrowRight,
  TrendingUp,
  Sparkles,
  MapPin,
  Clock,
  Navigation,
} from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CupVision Admin" }] }),
  component: Dashboard,
});

function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin", "tournament"],
    queryFn: () => api.get<any>("/api/stats/tournament"),
  });
  const channels = useQuery({
    queryKey: ["admin-channels"],
    queryFn: () => api.authed<any[]>("/api/channels/admin"),
  });
  const matches = useQuery({
    queryKey: ["admin-matches"],
    queryFn: () => api.get<Match[]>("/api/matches"),
  });

  const isLoading = stats.isLoading || channels.isLoading || matches.isLoading;

  // Compute enrichments
  const liveMatches = matches.data?.filter((m) => m.status === "live") || [];
  const upcomingMatches =
    matches.data
      ?.filter((m) => m.status === "scheduled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 3) || [];
  const recentMatches =
    matches.data
      ?.filter((m) => m.status === "completed")
      .sort((a, b) => b.matchNumber - a.matchNumber)
      .slice(0, 3) || [];

  const completedCount = stats.data?.completed ?? 0;
  const totalMatches = stats.data?.totalMatches ?? 0;
  const teamsCount = stats.data?.teamsCount ?? 0;
  const goalsCount = stats.data?.goals ?? 0;
  const channelsCount = channels.data?.length ?? 0;
  const avgGoals = completedCount > 0 ? (goalsCount / completedCount).toFixed(2) : "0.00";
  const completionRate = totalMatches > 0 ? Math.round((completedCount / totalMatches) * 100) : 0;

  // Stages stats
  const STAGES_ORDER = [
    "Group Stage",
    "Round of 16",
    "Quarter-finals",
    "Semi-finals",
    "Third Place",
    "Final",
  ];
  const stageStats = STAGES_ORDER.map((stage) => {
    const stageMatches = matches.data?.filter((m) => m.stage.toLowerCase().includes(stage.toLowerCase())) || [];
    const total = stageMatches.length;
    const completed = stageMatches.filter((m) => m.status === "completed").length;
    return { stage, total, completed };
  }).filter((s) => s.total > 0);

  // Quick Action Navigation Items
  const quickActions = [
    {
      to: "/admin/matches",
      label: "Matches",
      desc: "Manage schedules & scores",
      icon: Calendar,
      color: "from-blue-500 to-indigo-500",
    },
    {
      to: "/admin/bracket",
      label: "Bracket",
      desc: "Seed knockout rounds",
      icon: GitBranch,
      color: "from-emerald-500 to-teal-500",
    },
    {
      to: "/admin/channels",
      label: "Channels",
      desc: "Manage stream sources",
      icon: Radio,
      color: "from-rose-500 to-pink-500",
    },
    {
      to: "/admin/teams",
      label: "Teams",
      desc: "Manage country catalogs",
      icon: Users,
      color: "from-amber-500 to-orange-500",
    },
    {
      to: "/admin/import",
      label: "Import Matches",
      desc: "Sync external match data",
      icon: Upload,
      color: "from-purple-500 to-violet-500",
    },
    {
      to: "/admin/nav",
      label: "Navigation",
      desc: "Toggle public categories",
      icon: Navigation,
      color: "from-cyan-500 to-blue-500",
    },
  ];

  if (isLoading) {
    return (
      <AdminShell>
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-96 lg:col-span-2" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="space-y-8 max-w-7xl mx-auto pb-12">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                <Sparkles className="size-3" /> Core Hub
              </span>
              {liveMatches.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-400/20 animate-pulse">
                  <span className="size-1.5 rounded-full bg-red-500" /> {liveMatches.length} Live
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground/70 bg-clip-text text-transparent">
              Tournament Control Center
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time monitoring, bracket progression, and core database entities.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/matches"
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm shadow-primary/25"
            >
              Manage Matches <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Dynamic Highlight KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Tournament Progress */}
          <div className="relative group overflow-hidden bg-card border border-border/80 hover:border-primary/45 rounded-xl p-5 transition-all hover:shadow-md hover:shadow-primary/5">
            <div className="absolute top-0 right-0 p-3 opacity-10 text-primary group-hover:scale-110 transition-transform">
              <Trophy className="size-12" />
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Tournament Progress
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">{completionRate}%</span>
              <span className="text-xs text-muted-foreground font-medium">
                ({completedCount}/{totalMatches} matches)
              </span>
            </div>
            <div className="mt-3.5 w-full bg-secondary/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>

          {/* Card 2: Live matches count */}
          <div
            className={`relative group overflow-hidden border rounded-xl p-5 transition-all ${
              liveMatches.length > 0
                ? "bg-red-500/5 border-red-500/25 shadow-sm shadow-red-500/5"
                : "bg-card border-border/80 hover:border-red-500/30"
            }`}
          >
            <div className="absolute top-0 right-0 p-3 opacity-15 text-red-500 group-hover:scale-110 transition-transform">
              <Activity className="size-12" />
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              Live Matches
              {liveMatches.length > 0 && (
                <span className="size-2 rounded-full bg-red-500 animate-ping" />
              )}
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">{liveMatches.length}</span>
              <span className="text-xs text-muted-foreground font-medium">currently active</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-4 truncate">
              {liveMatches.length > 0
                ? `${liveMatches.map((m) => `${m.homeTeam?.name || "TBD"} vs ${m.awayTeam?.name || "TBD"}`).join(", ")}`
                : "No matches live right now"}
            </div>
          </div>

          {/* Card 3: Goals statistics */}
          <div className="relative group overflow-hidden bg-card border border-border/80 hover:border-amber-500/30 rounded-xl p-5 transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 p-3 opacity-10 text-amber-500 group-hover:scale-110 transition-transform">
              <TrendingUp className="size-12" />
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Total Goals Scored
            </div>
            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold tracking-tight">{goalsCount}</span>
              <span className="text-xs text-muted-foreground font-medium">goals total</span>
            </div>
            <div className="text-[11px] text-muted-foreground mt-4">
              Average <span className="font-semibold text-foreground">{avgGoals}</span> goals per match
            </div>
          </div>

          {/* Card 4: Entities Quick Info */}
          <div className="relative group overflow-hidden bg-card border border-border/80 hover:border-emerald-500/30 rounded-xl p-5 transition-all hover:shadow-md">
            <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-500 group-hover:scale-110 transition-transform">
              <Users className="size-12" />
            </div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Configured Catalog
            </div>
            <div className="mt-2.5 flex items-baseline gap-4">
              <div>
                <span className="text-3xl font-extrabold tracking-tight">{teamsCount}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">Teams</span>
              </div>
              <div className="w-px h-8 bg-border" />
              <div>
                <span className="text-3xl font-extrabold tracking-tight">{channelsCount}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">Streams</span>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground mt-2.5">
              Online streaming channels configured
            </div>
          </div>
        </div>

        {/* Live Matches Spotlight Panel */}
        {liveMatches.length > 0 && (
          <div className="bg-gradient-to-r from-red-500/10 via-destructive/5 to-background border border-red-500/20 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full size-2.5 bg-red-500" />
                </span>
                <h2 className="text-lg font-bold tracking-tight text-foreground">Live Matches Spotlight</h2>
              </div>
              <Link
                to="/admin/matches"
                className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                Go to Match Manager <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveMatches.map((m) => (
                <div
                  key={m._id}
                  className="bg-card/75 backdrop-blur-sm border border-border/80 rounded-lg p-4 flex flex-col justify-between hover:border-red-500/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                      {m.stage}
                    </span>
                    <StatusBadge status={m.status} minute={m.liveMinute} label={m.liveStatusLabel} />
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3 w-5/12">
                      <TeamFlag team={m.homeTeam} className="size-8" />
                      <span className="font-bold text-sm truncate">{m.homeTeam?.name || "TBD"}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 px-3 py-1 bg-secondary/80 rounded-md text-base font-extrabold w-2/12">
                      <span>{m.homeScore ?? 0}</span>
                      <span className="text-muted-foreground text-xs font-normal">:</span>
                      <span>{m.awayScore ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-end gap-3 w-5/12">
                      <span className="font-bold text-sm truncate">{m.awayTeam?.name || "TBD"}</span>
                      <TeamFlag team={m.awayTeam} className="size-8" />
                    </div>
                  </div>
                  {m.notes && (
                    <div className="text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1 italic mt-1.5 truncate">
                      {m.notes}
                    </div>
                  )}
                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" /> {m.stadium}, {m.city}
                    </span>
                    <Link
                      to="/admin/matches"
                      className="text-primary hover:underline font-semibold flex items-center gap-0.5"
                    >
                      Update Live score <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info Columns (Col span 7) */}
          <div className="lg:col-span-7 space-y-8">
            {/* Stage Progress section */}
            <div className="bg-card border border-border/80 rounded-xl p-6">
              <h2 className="text-lg font-bold tracking-tight mb-1">Stage Progression</h2>
              <p className="text-xs text-muted-foreground mb-6">Completed matches by tournament stages.</p>
              <div className="space-y-4">
                {stageStats.map((item) => {
                  const percent = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
                  return (
                    <div key={item.stage} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-foreground">{item.stage}</span>
                        <span className="text-muted-foreground">
                          {item.completed} / {item.total} Completed ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Match Results */}
            <div className="bg-card border border-border/80 rounded-xl p-6">
              <h2 className="text-lg font-bold tracking-tight mb-1">Recent Results</h2>
              <p className="text-xs text-muted-foreground mb-6">Latest finalized scorecards from DB.</p>
              <div className="divide-y divide-border/40">
                {recentMatches.length > 0 ? (
                  recentMatches.map((m) => (
                    <div key={m._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3 w-4/12">
                        <TeamFlag team={m.homeTeam} className="size-6" />
                        <span className="text-sm font-semibold truncate">{m.homeTeam?.name || "TBD"}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 px-2.5 py-0.5 bg-secondary/50 rounded text-sm font-bold w-2/12">
                        <span>{m.homeScore ?? 0}</span>
                        <span className="text-muted-foreground text-[10px] font-normal">-</span>
                        <span>{m.awayScore ?? 0}</span>
                      </div>
                      <div className="flex items-center justify-end gap-3 w-4/12">
                        <span className="text-sm font-semibold truncate">{m.awayTeam?.name || "TBD"}</span>
                        <TeamFlag team={m.awayTeam} className="size-6" />
                      </div>
                      <div className="w-2/12 text-right">
                        <span className="text-[10px] text-muted-foreground block font-medium truncate">
                          Match #{m.matchNumber}
                        </span>
                        <span className="text-[9px] text-muted-foreground block truncate">
                          {formatMatchDate(m.date, m.time, "MMM D")}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No completed matches recorded yet.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column (Col span 5) */}
          <div className="lg:col-span-5 space-y-8">
            {/* Quick Actions Grid */}
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-1">Quick Navigation</h2>
              <p className="text-xs text-muted-foreground mb-4">Core entities & admin settings tabs.</p>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex flex-col items-start p-4 bg-card border border-border/80 hover:border-primary/40 rounded-xl transition-all hover:-translate-y-0.5 group text-left"
                  >
                    <div
                      className={`p-2 bg-gradient-to-br ${action.color} text-white rounded-lg mb-3 shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <action.icon className="size-4" />
                    </div>
                    <span className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                      {action.label}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1 leading-snug">
                      {action.desc}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Upcoming Matches */}
            <div className="bg-card border border-border/80 rounded-xl p-6">
              <h2 className="text-lg font-bold tracking-tight mb-1">Upcoming Matches</h2>
              <p className="text-xs text-muted-foreground mb-6">Next scheduled fixtures.</p>
              <div className="space-y-4">
                {upcomingMatches.length > 0 ? (
                  upcomingMatches.map((m) => (
                    <div
                      key={m._id}
                      className="flex items-center justify-between p-3 bg-secondary/20 border border-border/40 rounded-lg hover:border-border transition-all"
                    >
                      <div className="space-y-2 w-8/12">
                        <div className="flex items-center gap-2">
                          <TeamFlag team={m.homeTeam} className="size-5" />
                          <span className="text-xs font-semibold truncate">{m.homeTeam?.name || "TBD"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TeamFlag team={m.awayTeam} className="size-5" />
                          <span className="text-xs font-semibold truncate">{m.awayTeam?.name || "TBD"}</span>
                        </div>
                      </div>
                      <div className="text-right w-4/12 shrink-0 border-l border-border/40 pl-3">
                        <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-primary">
                          <Clock className="size-3" />
                          <span>{formatMatchTime(m.date, m.time, "LT")}</span>
                        </div>
                        <div className="text-[9px] text-muted-foreground mt-0.5">
                          {formatMatchDate(m.date, m.time, "MMM D")}
                        </div>
                        <div className="text-[9px] text-muted-foreground font-medium truncate mt-0.5">
                          {m.stage}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-sm text-muted-foreground">
                    No scheduled upcoming matches.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

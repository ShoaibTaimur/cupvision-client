import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api, Match, Standing, Team } from "@/lib/api";
import { SectionReveal } from "@/components/section-reveal";
import { Skeleton, TableRowSkeleton, MatchCardSkeleton } from "@/components/skeleton";
import { MatchCard } from "@/components/match-card";
import { Search, X } from "lucide-react";

export const Route = createFileRoute("/scoreboard")({
  head: () => ({
    meta: [
      { title: "Scoreboard — CupVision" },
      { name: "description", content: "Live group standings ranked by points and wins." },
      { property: "og:title", content: "Scoreboard — CupVision" },
      { property: "og:description", content: "Live group standings for the 2026 FIFA World Cup." },
    ],
  }),
  component: ScoreboardPage,
});

function ScoreboardPage() {
  const [q, setQ] = useState("");
  const [openTeam, setOpenTeam] = useState<string | null>(null);
  const standings = useQuery({
    queryKey: ["scoreboard"],
    queryFn: () => api.get<Standing[]>("/api/stats/scoreboard"),
  });

  const filtered = useMemo(() => {
    const list = standings.data || [];
    if (!q) return list;
    const n = q.toLowerCase();
    return list.filter((s) => s.team.name.toLowerCase().includes(n));
  }, [standings.data, q]);

  return (
    <SectionReveal delay={0.08} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Scoreboard</h1>
      <p className="text-muted-foreground mb-6">
        Win = 3 pts · Draw = 1 pt · Loss = 0 pts. Ranked by points, then wins, then name.
      </p>

      <div className="relative max-w-md mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search team"
          className="w-full bg-card border border-border rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {standings.isLoading ? (
        <div className="overflow-x-auto bg-card border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
              <tr>
                <th className="px-3 py-3 text-left">#</th>
                <th className="px-3 py-3 text-left">Team</th>
                <th className="px-3 py-3 text-right">P</th>
                <th className="px-3 py-3 text-right">W</th>
                <th className="px-3 py-3 text-right">D</th>
                <th className="px-3 py-3 text-right">L</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">GF</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">GA</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">GD</th>
                <th className="px-3 py-3 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }).map((_, i) => (
                <TableRowSkeleton key={i} cols={10} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-x-auto bg-card border border-border rounded-lg">
          <table className="w-full text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground border-b border-border">
              <tr>
                <th className="px-3 py-3 text-left">#</th>
                <th className="px-3 py-3 text-left">Team</th>
                <th className="px-3 py-3 text-right">P</th>
                <th className="px-3 py-3 text-right">W</th>
                <th className="px-3 py-3 text-right">D</th>
                <th className="px-3 py-3 text-right">L</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">GF</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">GA</th>
                <th className="px-3 py-3 text-right hidden sm:table-cell">GD</th>
                <th className="px-3 py-3 text-right">Pts</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, idx) => (
                <tr
                  key={s.teamId}
                  onClick={() => setOpenTeam(s.teamId)}
                  className="border-b border-border last:border-0 hover:bg-secondary cursor-pointer transition-colors"
                >
                  <td className="px-3 py-3 text-muted-foreground">{idx + 1}</td>
                  <td className="px-3 py-3 font-medium">
                    {s.team.name}
                    {s.team.group && (
                      <span className="ml-2 text-[10px] text-muted-foreground">
                        Group {s.team.group}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.played}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.wins}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.draws}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.losses}</td>
                  <td className="px-3 py-3 text-right tabular-nums hidden sm:table-cell">
                    {s.goalsFor}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums hidden sm:table-cell">
                    {s.goalsAgainst}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums hidden sm:table-cell">
                    {s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-primary tabular-nums">
                    {s.points}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">
                    No teams found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {openTeam && <TeamModal teamId={openTeam} onClose={() => setOpenTeam(null)} />}
    </SectionReveal>
  );
}

type Tab = "overview" | "wins" | "draws" | "losses" | "upcoming";

function TeamModal({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const team = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => api.get<Team>(`/api/teams/${teamId}`),
  });
  const detail = useQuery({
    queryKey: ["team-stats", teamId],
    queryFn: () =>
      api.get<{
        standing: Standing;
        wins: Match[];
        draws: Match[];
        losses: Match[];
        upcoming: Match[];
      }>(`/api/stats/team/${teamId}`),
  });
  const d = detail.data;
  const tabs: Tab[] = ["overview", "wins", "draws", "losses", "upcoming"];
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card/95 border border-border/80 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">
              {team.isLoading ? <Skeleton className="h-6 w-32" /> : team.data?.name || "Team"}
            </h3>
            {!team.isLoading && team.data?.group && (
              <p className="text-xs text-muted-foreground">Group {team.data.group}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-border flex gap-1.5 overflow-x-auto bg-muted/20">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all active:scale-95 ${
                tab === t
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="p-5 overflow-y-auto flex-1">
          {detail.isLoading ? (
            <Skeleton className="h-32" />
          ) : !d ? (
            <p className="text-sm text-muted-foreground">No data.</p>
          ) : tab === "overview" ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Played",
                  value: d.standing?.played ?? 0,
                  style: "bg-secondary/40 border border-white/5",
                },
                {
                  label: "Wins",
                  value: d.standing?.wins ?? 0,
                  style: "bg-primary/5 border border-primary/20 text-primary",
                },
                {
                  label: "Draws",
                  value: d.standing?.draws ?? 0,
                  style: "bg-yellow-500/5 border border-yellow-500/20 text-yellow-500",
                },
                {
                  label: "Losses",
                  value: d.standing?.losses ?? 0,
                  style: "bg-destructive/5 border border-destructive/20 text-destructive",
                },
                {
                  label: "Goals For",
                  value: d.standing?.goalsFor ?? 0,
                  style: "bg-secondary/40 border border-white/5",
                },
                {
                  label: "Goals Against",
                  value: d.standing?.goalsAgainst ?? 0,
                  style: "bg-secondary/40 border border-white/5",
                },
                {
                  label: "Goal Diff",
                  value: d.standing?.goalDiff ?? 0,
                  style: "bg-secondary/40 border border-white/5",
                },
                {
                  label: "Points",
                  value: d.standing?.points ?? 0,
                  style:
                    "bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 text-white shadow-[0_4px_20px_rgba(117,197,255,0.15)] font-extrabold",
                },
              ].map(({ label, value, style }) => (
                <div
                  key={label}
                  className={`rounded-xl p-4 transition-all duration-300 hover:scale-[1.02] ${style}`}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-75">
                    {label}
                  </div>
                  <div className="mt-1 text-2xl font-black tabular-nums">{value}</div>
                </div>
              ))}
            </div>
          ) : (
            <MatchList list={d[tab]} />
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function MatchList({ list }: { list: Match[] }) {
  if (!list?.length) return <p className="text-sm text-muted-foreground">No matches.</p>;
  return (
    <div className="space-y-2">
      {list.map((m) => (
        <MatchCard key={m._id} m={m} />
      ))}
    </div>
  );
}

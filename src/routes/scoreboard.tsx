import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, Match, Standing, Team } from "@/lib/api";
import { Skeleton } from "@/components/skeleton";
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
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
        <Skeleton className="h-96" />
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
                  <td className="px-3 py-3 font-medium">{s.team.name}{s.team.group && <span className="ml-2 text-[10px] text-muted-foreground">Group {s.team.group}</span>}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.played}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.wins}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.draws}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{s.losses}</td>
                  <td className="px-3 py-3 text-right tabular-nums hidden sm:table-cell">{s.goalsFor}</td>
                  <td className="px-3 py-3 text-right tabular-nums hidden sm:table-cell">{s.goalsAgainst}</td>
                  <td className="px-3 py-3 text-right tabular-nums hidden sm:table-cell">{s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff}</td>
                  <td className="px-3 py-3 text-right font-bold text-primary tabular-nums">{s.points}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-3 py-8 text-center text-muted-foreground">No teams found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {openTeam && <TeamModal teamId={openTeam} onClose={() => setOpenTeam(null)} />}
    </div>
  );
}

type Tab = "overview" | "wins" | "draws" | "losses" | "upcoming";

function TeamModal({ teamId, onClose }: { teamId: string; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>("overview");
  const team = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => api.get<Team>(`/api/teams/${teamId}`),
  });
  const detail = useQuery({
    queryKey: ["team-stats", teamId],
    queryFn: () => api.get<{
      standing: Standing;
      wins: Match[];
      draws: Match[];
      losses: Match[];
      upcoming: Match[];
    }>(`/api/stats/team/${teamId}`),
  });
  const d = detail.data;
  const tabs: Tab[] = ["overview", "wins", "draws", "losses", "upcoming"];
  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{team.data?.name || "Team"}</h3>
            {team.data?.group && <p className="text-xs text-muted-foreground">Group {team.data.group}</p>}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary transition-colors">
            <X className="size-4" />
          </button>
        </div>
        <div className="px-5 pt-3 border-b border-border flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 text-sm capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ["Played", d.standing?.played ?? 0],
                ["Wins", d.standing?.wins ?? 0],
                ["Draws", d.standing?.draws ?? 0],
                ["Losses", d.standing?.losses ?? 0],
                ["Goals for", d.standing?.goalsFor ?? 0],
                ["Goals against", d.standing?.goalsAgainst ?? 0],
                ["Goal diff", d.standing?.goalDiff ?? 0],
                ["Points", d.standing?.points ?? 0],
              ].map(([l, v]) => (
                <div key={l as string} className="bg-secondary rounded-md p-3">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{l}</div>
                  <div className="text-xl font-bold tabular-nums">{v}</div>
                </div>
              ))}
            </div>
          ) : (
            <MatchList list={d[tab]} />
          )}
        </div>
      </div>
    </div>
  );
}

function MatchList({ list }: { list: Match[] }) {
  if (!list?.length) return <p className="text-sm text-muted-foreground">No matches.</p>;
  return (
    <div className="space-y-2">
      {list.map((m) => <MatchCard key={m._id} m={m} />)}
    </div>
  );
}

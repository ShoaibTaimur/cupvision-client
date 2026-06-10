import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, Player, Team } from "@/lib/api";
import { SectionReveal } from "@/components/section-reveal";
import { Skeleton, PlayerCardSkeleton, TeamListSkeleton } from "@/components/skeleton";
import { Search, Shield, Shirt, User, ChevronDown, X } from "lucide-react";
import { createPortal } from "react-dom";
import { useEffect } from "react";

export const Route = createFileRoute("/squads")({
  head: () => ({
    meta: [
      { title: "Squads — CupVision" },
      {
        name: "description",
        content:
          "Browse the full squads of every team competing in the FIFA World Cup 2026 — goalkeepers, defenders, midfielders and forwards.",
      },
      { property: "og:title", content: "Squads — CupVision" },
      {
        property: "og:description",
        content: "Full team rosters with players by position for the 2026 World Cup.",
      },
    ],
  }),
  component: SquadsPage,
});

const POS = [
  { id: "all", label: "All" },
  { id: "GK", label: "Goalkeepers" },
  { id: "DEF", label: "Defenders" },
  { id: "MID", label: "Midfielders" },
  { id: "FWD", label: "Forwards" },
] as const;

const POS_STYLES: Record<string, string> = {
  GK: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
  DEF: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  MID: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  FWD: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function SquadsPage() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [pos, setPos] = useState<(typeof POS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    if (pickerOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [pickerOpen]);

  const teamsQ = useQuery({
    queryKey: ["teams"],
    queryFn: () => api.get<Team[]>("/api/teams"),
  });

  const playersQ = useQuery({
    queryKey: ["players", teamId],
    queryFn: () => api.get<Player[]>(teamId ? `/api/players?teamId=${teamId}` : "/api/players"),
    enabled: !!teamId,
  });

  const filteredTeams = useMemo(() => {
    const list = teamsQ.data || [];
    if (!q) return list;
    const n = q.toLowerCase();
    return list.filter((t) => t.name.toLowerCase().includes(n));
  }, [teamsQ.data, q]);

  const activeTeam = useMemo(
    () => teamsQ.data?.find((t) => t._id === teamId) || null,
    [teamsQ.data, teamId],
  );

  const coach = useMemo(
    () => (playersQ.data || []).find((p) => p.position === "COACH") || null,
    [playersQ.data],
  );

  const playerList = useMemo(
    () => (playersQ.data || []).filter((p) => p.position !== "COACH"),
    [playersQ.data],
  );

  const grouped = useMemo(() => {
    const visible = pos === "all" ? playerList : playerList.filter((p) => p.position === pos);
    return visible;
  }, [playerList, pos]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: playerList.length, GK: 0, DEF: 0, MID: 0, FWD: 0 };
    playerList.forEach((p) => (c[p.position] = (c[p.position] || 0) + 1));
    return c;
  }, [playerList]);

  return (
    <SectionReveal delay={0.08} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Squads</h1>
        <p className="text-muted-foreground">
          Pick a team to see its full roster — goalkeepers, defenders, midfielders, forwards.
        </p>
      </div>

      {/* Mobile/tablet: team picker as a button that opens a modal */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-left"
        >
          <Shield className="size-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              Team
            </div>
            <div className="font-semibold truncate">{activeTeam?.name || "Select a team"}</div>
          </div>
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        </button>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Desktop sidebar team picker */}
        <aside className="hidden lg:block bg-card border border-border rounded-lg p-3 h-fit lg:sticky lg:top-20">
          <TeamList
            teams={filteredTeams}
            loading={teamsQ.isLoading}
            q={q}
            setQ={setQ}
            teamId={teamId}
            onPick={(id) => {
              setTeamId(id);
              setPos("all");
            }}
          />
        </aside>

        {/* Players panel */}
        <section className="min-w-0">
          {!teamId ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Shirt className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-semibold mb-1">Select a team</h2>
              <p className="text-sm text-muted-foreground">
                Pick a team from the list to view its squad.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg p-5">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-md bg-primary/15 flex items-center justify-center text-primary">
                    <Shield className="size-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{activeTeam?.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {counts.all} players · {counts.GK} GK · {counts.DEF} DEF · {counts.MID} MID ·{" "}
                      {counts.FWD} FWD
                    </p>
                  </div>
                </div>
              </div>

              {coach && (
                <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3">
                  <div className="size-12 rounded-full bg-primary/15 text-primary flex items-center justify-center">
                    <User className="size-6" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
                      {coach.role || "Head Coach"}
                    </div>
                    <div className="font-semibold truncate">{coach.name}</div>
                    {coach.nationality && (
                      <div className="text-xs text-muted-foreground truncate">
                        {coach.nationality}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Position tabs */}
              <div className="flex flex-wrap gap-2">
                {POS.map((p) => {
                  const active = pos === p.id;
                  const count = counts[p.id] ?? 0;
                  return (
                    <button
                      key={p.id}
                      onClick={() => setPos(p.id)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border transition-colors ${
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary"
                      }`}
                    >
                      {p.label}
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${active ? "bg-primary-foreground/20" : "bg-secondary"}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {playersQ.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <PlayerCardSkeleton key={i} />
                  ))}
                </div>
              ) : grouped.length === 0 ? (
                <div className="bg-card border border-border rounded-lg p-12 text-center text-sm text-muted-foreground">
                  No players in this category.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {grouped.map((p) => (
                    <PlayerCard key={p._id} p={p} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Mobile team picker modal */}
      {pickerOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="lg:hidden fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
            <div
              className="absolute inset-0 bg-background/70 backdrop-blur-md"
              onClick={() => setPickerOpen(false)}
            />
            <div className="relative bg-card border border-border rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[85vh] flex flex-col shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="font-semibold">Select a team</div>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="inline-flex items-center justify-center size-9 rounded-md hover:bg-secondary"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="p-3 flex-1 overflow-hidden flex flex-col">
                <TeamList
                  teams={filteredTeams}
                  loading={teamsQ.isLoading}
                  q={q}
                  setQ={setQ}
                  teamId={teamId}
                  onPick={(id) => {
                    setTeamId(id);
                    setPos("all");
                    setPickerOpen(false);
                  }}
                />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </SectionReveal>
  );
}

function TeamList({
  teams,
  loading,
  q,
  setQ,
  teamId,
  onPick,
}: {
  teams: Team[];
  loading: boolean;
  q: string;
  setQ: (v: string) => void;
  teamId: string | null;
  onPick: (id: string) => void;
}) {
  return (
    <>
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teams..."
          className="w-full bg-background border border-border rounded-md pl-9 pr-3 py-2 text-sm"
        />
      </div>
      {loading ? (
        <TeamListSkeleton count={8} />
      ) : (
        <div className="flex-1 max-h-[70vh] overflow-y-auto space-y-1 pr-1">
          {teams.map((t) => {
            const active = t._id === teamId;
            return (
              <button
                key={t._id}
                onClick={() => onPick(t._id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <Shield className="size-4 shrink-0" />
                <span className="flex-1 text-left truncate">{t.name}</span>
                {t.group && <span className="text-[10px] opacity-70">Group {t.group}</span>}
              </button>
            );
          })}
          {teams.length === 0 && (
            <div className="text-xs text-muted-foreground text-center py-8">No teams found</div>
          )}
        </div>
      )}
    </>
  );
}

function PlayerCard({ p }: { p: Player }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:border-primary/40 transition-colors">
      <div className="size-12 rounded-full bg-secondary flex items-center justify-center text-sm font-bold tabular-nums">
        {p.jerseyNumber ?? <User className="size-5 text-muted-foreground" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">{p.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {p.club || p.nationality || "—"}
        </div>
      </div>
      <span
        className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-md border ${POS_STYLES[p.position]}`}
      >
        {p.position}
      </span>
    </div>
  );
}

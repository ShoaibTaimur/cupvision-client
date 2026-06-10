import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { api, Player, Team } from "@/lib/api";
import { SectionReveal } from "@/components/section-reveal";
import { PlayerCardSkeleton, TeamListSkeleton } from "@/components/skeleton";
import { Search, Shield, Shirt, User, ChevronDown, X, Calendar, Ruler, Building2 } from "lucide-react";
import { createPortal } from "react-dom";
import playerImagesData from "@/data/player-images.json";

const playerImages = playerImagesData as Record<string, string>;

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

const POS_GRADIENT: Record<string, string> = {
  GK: "from-yellow-500/20 via-yellow-500/5 to-transparent",
  DEF: "from-sky-500/20 via-sky-500/5 to-transparent",
  MID: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  FWD: "from-rose-500/20 via-rose-500/5 to-transparent",
};

function SquadsPage() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [pos, setPos] = useState<(typeof POS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  useEffect(() => {
    if (pickerOpen || selectedPlayer) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [pickerOpen, selectedPlayer]);

  const teamsQ = useQuery({
    queryKey: ["teams"],
    queryFn: () => api.get<Team[]>("/api/teams"),
  });

  useEffect(() => {
    if (teamsQ.data && teamsQ.data.length > 0 && !teamId) {
      setTeamId(teamsQ.data[0]._id);
    }
  }, [teamsQ.data, teamId]);

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
                    <PlayerCard key={p._id} p={p} onClick={() => setSelectedPlayer(p)} />
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

      {/* Player details modal */}
      {selectedPlayer &&
        typeof document !== "undefined" &&
        createPortal(
          <PlayerModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />,
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

function PlayerCard({ p, onClick }: { p: Player; onClick: () => void }) {
  const imageUrl = playerImages[p._id];

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-card border border-border rounded-lg p-4 flex items-center gap-3 hover:border-primary/50 hover:bg-secondary/40 transition-all duration-200 cursor-pointer group"
    >
      <div className="size-12 rounded-full bg-secondary flex items-center justify-center overflow-hidden shrink-0 ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-200">
        {imageUrl ? (
          <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" />
        ) : p.jerseyNumber ? (
          <span className="text-sm font-bold tabular-nums">{p.jerseyNumber}</span>
        ) : (
          <User className="size-5 text-muted-foreground" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">
          {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}
          {p.name}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {p.club || p.nationality || "—"}
        </div>
      </div>
      <span
        className={`text-[10px] uppercase tracking-wide font-bold px-2 py-1 rounded-md border shrink-0 ${POS_STYLES[p.position]}`}
      >
        {p.position}
      </span>
    </button>
  );
}

function PlayerModal({ player, onClose }: { player: Player; onClose: () => void }) {
  const imageUrl = playerImages[player._id];
  const gradient = POS_GRADIENT[player.position] || "from-primary/20 via-primary/5 to-transparent";

  const formattedDob = player.dateOfBirth
    ? new Date(player.dateOfBirth).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const age = player.dateOfBirth
    ? Math.floor(
        (Date.now() - new Date(player.dateOfBirth).getTime()) / (365.25 * 24 * 3600 * 1000),
      )
    : null;

  const posLabel =
    player.position === "GK"
      ? "Goalkeeper"
      : player.position === "DEF"
        ? "Defender"
        : player.position === "MID"
          ? "Midfielder"
          : "Forward";

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ animation: "cvFadeIn 0.15s ease-out" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-md" onClick={onClose} />

      {/* Modal panel */}
      <div
        className="relative bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
        style={{ animation: "cvScaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)" }}
      >
        {/* Position-colored gradient header */}
        <div
          className={`absolute inset-x-0 top-0 h-44 bg-gradient-to-b ${gradient} pointer-events-none`}
        />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 inline-flex items-center justify-center size-8 rounded-full bg-background/60 hover:bg-secondary border border-border/50 backdrop-blur-sm transition-colors"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        {/* Avatar + name section */}
        <div className="relative pt-8 pb-5 px-6 flex flex-col items-center text-center">
          {/* Jersey number — top left */}
          {player.jerseyNumber && (
            <div className="absolute top-8 left-6 text-xs font-bold text-muted-foreground">
              #{player.jerseyNumber}
            </div>
          )}

          {/* Large avatar */}
          <div className="size-32 rounded-full bg-secondary border-4 border-border flex items-center justify-center overflow-hidden shadow-xl mb-4">
            {imageUrl ? (
              <img src={imageUrl} alt={player.name} className="w-full h-full object-cover" />
            ) : player.jerseyNumber ? (
              <span className="text-4xl font-black tabular-nums text-foreground">
                {player.jerseyNumber}
              </span>
            ) : (
              <User className="size-14 text-muted-foreground" />
            )}
          </div>

          {/* Position badge */}
          <span
            className={`text-[11px] uppercase tracking-widest font-bold px-3 py-1 rounded-full border mb-3 ${POS_STYLES[player.position]}`}
          >
            {posLabel}
          </span>

          <h2 className="text-xl font-black tracking-tight leading-tight">{player.name}</h2>
          {player.nationality && (
            <p className="text-sm text-muted-foreground mt-1">{player.nationality}</p>
          )}
        </div>

        {/* Details */}
        {(player.club || formattedDob || player.height) && (
          <div className="px-6 pb-6 grid grid-cols-1 gap-2.5">
            {player.club && (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3">
                <Building2 className="size-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
                    Club
                  </div>
                  <div className="text-sm font-semibold truncate">{player.club}</div>
                </div>
              </div>
            )}
            {formattedDob && (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3">
                <Calendar className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
                    Date of Birth
                  </div>
                  <div className="text-sm font-semibold">
                    {formattedDob}
                    {age !== null && (
                      <span className="text-muted-foreground font-normal ml-1.5">({age} yrs)</span>
                    )}
                  </div>
                </div>
              </div>
            )}
            {player.height && (
              <div className="flex items-center gap-3 bg-secondary/50 rounded-xl px-4 py-3">
                <Ruler className="size-4 text-muted-foreground shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold mb-0.5">
                    Height
                  </div>
                  <div className="text-sm font-semibold">{player.height} cm</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes cvFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes cvScaleIn { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
}

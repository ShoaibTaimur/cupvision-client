import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useEffect } from "react";
import { api, Player, Team } from "@/lib/api";
import { SectionReveal } from "@/components/section-reveal";
import { PlayerCardSkeleton, TeamListSkeleton } from "@/components/skeleton";
import { Search, Shield, Shirt, User, ChevronDown, Calendar, Ruler, Building2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

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
  FWD: "bg-primary/15 text-primary border-primary/30",
};

const POS_GRADIENT: Record<string, string> = {
  GK: "from-yellow-500/20 via-yellow-500/5 to-transparent",
  DEF: "from-sky-500/20 via-sky-500/5 to-transparent",
  MID: "from-emerald-500/20 via-emerald-500/5 to-transparent",
  FWD: "from-primary/20 via-primary/5 to-transparent",
};

function SquadsPage() {
  const [teamId, setTeamId] = useState<string | null>(null);
  const [pos, setPos] = useState<(typeof POS)[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

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

      {/* Mobile/tablet: team picker button → opens Drawer */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          onClick={() => setPickerOpen(true)}
          className="w-full flex items-center gap-3 px-4 py-3 h-auto justify-start"
        >
          <Shield className="size-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">
              Team
            </div>
            <div className="font-semibold truncate">{activeTeam?.name || "Select a team"}</div>
          </div>
          <ChevronDown className="size-4 text-muted-foreground shrink-0" />
        </Button>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* Desktop sidebar team picker */}
        <aside className="hidden lg:block">
          <Card className="h-fit lg:sticky lg:top-20 p-3">
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
          </Card>
        </aside>

        {/* Players panel */}
        <section className="min-w-0">
          {!teamId ? (
            <Card className="p-12 text-center">
              <Shirt className="size-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="font-semibold mb-1">Select a team</h2>
              <p className="text-sm text-muted-foreground">
                Pick a team from the list to view its squad.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="p-5">
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
                </CardContent>
              </Card>

              {coach && (
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <Avatar className="size-12">
                      <AvatarFallback className="bg-primary/15 text-primary">
                        <User className="size-6" />
                      </AvatarFallback>
                    </Avatar>
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
                  </CardContent>
                </Card>
              )}

              {/* Position tabs */}
              <Tabs value={pos} onValueChange={(v) => setPos(v as (typeof POS)[number]["id"])}>
                <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
                  {POS.map((p) => {
                    const count = counts[p.id] ?? 0;
                    return (
                      <TabsTrigger
                        key={p.id}
                        value={p.id}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm border border-border data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=inactive]:bg-card"
                      >
                        {p.label}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary data-[state=active]:bg-primary-foreground/20">
                          {count}
                        </span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>

              {playersQ.isLoading ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <PlayerCardSkeleton key={i} />
                  ))}
                </div>
              ) : grouped.length === 0 ? (
                <Card className="p-12 text-center text-sm text-muted-foreground">
                  No players in this category.
                </Card>
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

      {/* Mobile team picker — Drawer */}
      <Drawer open={pickerOpen} onOpenChange={setPickerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader>
            <DrawerTitle>Select a team</DrawerTitle>
            <DrawerDescription className="sr-only">Choose a team to view its squad</DrawerDescription>
          </DrawerHeader>
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
        </DrawerContent>
      </Drawer>

      {/* Player details — Dialog */}
      <Dialog open={!!selectedPlayer} onOpenChange={(open) => !open && setSelectedPlayer(null)}>
        <DialogContent className="sm:max-w-sm p-0 overflow-hidden gap-0 border-border">
          {selectedPlayer && <PlayerModalContent player={selectedPlayer} />}
        </DialogContent>
      </Dialog>
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
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search teams..."
          className="pl-9"
        />
      </div>
      {loading ? (
        <TeamListSkeleton count={8} />
      ) : (
        <ScrollArea className="h-[60vh] lg:h-[calc(100vh-14rem)]">
          <div className="space-y-1 pr-3">
            {teams.map((t) => {
              const active = t._id === teamId;
              return (
                <Button
                  key={t._id}
                  variant={active ? "default" : "ghost"}
                  onClick={() => onPick(t._id)}
                  className={`w-full justify-start gap-2 px-3 py-2 h-auto text-sm ${
                    active ? "font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <Shield className="size-4 shrink-0" />
                  <span className="flex-1 text-left truncate">{t.name}</span>
                  {t.group && <span className="text-[10px] opacity-70">Group {t.group}</span>}
                </Button>
              );
            })}
            {teams.length === 0 && (
              <div className="text-xs text-muted-foreground text-center py-8">No teams found</div>
            )}
          </div>
        </ScrollArea>
      )}
    </>
  );
}

function PlayerCard({ p, onClick }: { p: Player; onClick: () => void }) {
  const imageUrl = p.image;

  return (
    <Card
      onClick={onClick}
      className="p-4 flex items-center gap-3 hover:border-primary/50 hover:bg-secondary/40 transition-all duration-200 cursor-pointer group"
    >
      <Avatar className="size-12 ring-2 ring-transparent group-hover:ring-primary/30 transition-all duration-200">
        {imageUrl ? (
          <AvatarImage src={imageUrl} alt={p.name} />
        ) : null}
        <AvatarFallback className="bg-secondary">
          {p.jerseyNumber ? (
            <span className="text-sm font-bold tabular-nums">{p.jerseyNumber}</span>
          ) : (
            <User className="size-5 text-muted-foreground" />
          )}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="font-semibold truncate">
          {p.jerseyNumber ? `#${p.jerseyNumber} ` : ""}
          {p.name}
        </div>
        <div className="text-xs text-muted-foreground truncate">
          {p.club || p.nationality || "—"}
        </div>
      </div>
      <Badge
        variant="outline"
        className={`text-[10px] uppercase tracking-wide font-bold shrink-0 ${POS_STYLES[p.position]}`}
      >
        {p.position}
      </Badge>
    </Card>
  );
}

function PlayerModalContent({ player }: { player: Player }) {
  const imageUrl = player.image;
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

  return (
    <>
      <DialogHeader className="sr-only">
        <DialogTitle>{player.name}</DialogTitle>
        <DialogDescription>{posLabel} — {player.nationality || "Unknown"}</DialogDescription>
      </DialogHeader>

      {/* Position-colored gradient header */}
      <div
        className={`absolute inset-x-0 top-0 h-44 bg-gradient-to-b ${gradient} pointer-events-none`}
      />

      {/* Avatar + name section */}
      <div className="relative pt-8 pb-5 px-6 flex flex-col items-center text-center">
        {/* Jersey number — top left */}
        {player.jerseyNumber && (
          <div className="absolute top-8 left-6 text-xs font-bold text-muted-foreground">
            #{player.jerseyNumber}
          </div>
        )}

        {/* Large avatar */}
        <Avatar className="size-32 border-4 border-border shadow-xl mb-4">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={player.name} />
          ) : null}
          <AvatarFallback className="bg-secondary">
            {player.jerseyNumber ? (
              <span className="text-4xl font-black tabular-nums text-foreground">
                {player.jerseyNumber}
              </span>
            ) : (
              <User className="size-14 text-muted-foreground" />
            )}
          </AvatarFallback>
        </Avatar>

        {/* Position badge */}
        <Badge
          variant="outline"
          className={`text-[11px] uppercase tracking-widest font-bold rounded-full mb-3 ${POS_STYLES[player.position]}`}
        >
          {posLabel}
        </Badge>

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
    </>
  );
}

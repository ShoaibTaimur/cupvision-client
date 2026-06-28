import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, Match, Team } from "@/lib/api";
import { SectionReveal } from "@/components/section-reveal";
import { Trophy, MapPin, Calendar, Clock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/bracket")({
  head: () => ({
    meta: [
      { title: "Bracket — CupVision" },
      {
        name: "description",
        content:
          "Live FIFA World Cup 2026 knockout bracket — Round of 32 through the Final, auto-filled as each match finishes.",
      },
      { property: "og:title", content: "Bracket — CupVision" },
      {
        property: "og:description",
        content: "Knockout bracket map for the 2026 FIFA World Cup, auto-updating after each result.",
      },
    ],
  }),
  component: BracketPage,
});

type Column = {
  key: string;
  title: string;
  range: [number, number];
};

const COLUMNS: Column[] = [
  { key: "r32", title: "Round of 32", range: [73, 88] },
  { key: "r16", title: "Round of 16", range: [89, 96] },
  { key: "qf", title: "Quarter Finals", range: [97, 100] },
  { key: "sf", title: "Semi Finals", range: [101, 102] },
  { key: "final", title: "Final", range: [104, 104] },
];

function teamLabel(t?: Team | null, fallback = "TBD") {
  if (!t) return fallback;
  if (!t.name || t.name === "TBD") return fallback;
  return t.name;
}

function Slot({
  team,
  isWinner,
  isLoser,
  score,
  placeholder,
}: {
  team?: Team | null;
  isWinner: boolean;
  isLoser: boolean;
  score?: number;
  placeholder: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs sm:text-sm transition-colors ${
        isWinner
          ? "bg-primary/10 font-semibold text-white"
          : isLoser
          ? "text-white/35"
          : "text-white/80"
      }`}
    >
      <div className="flex min-w-0 items-center gap-2">
        {team?.flag ? (
          <img
            src={team.flag}
            alt=""
            className={`size-4 shrink-0 rounded-sm object-cover ${isLoser ? "opacity-40 grayscale" : ""}`}
            loading="lazy"
          />
        ) : (
          <span className="size-4 shrink-0 rounded-sm bg-white/10" />
        )}
        <span className={`truncate ${isLoser ? "line-through decoration-white/30" : ""}`}>
          {teamLabel(team, placeholder)}
        </span>
      </div>
      {typeof score === "number" ? (
        <span
          className={`tabular-nums ${
            isWinner ? "text-white" : isLoser ? "text-white/40" : "text-white/70"
          }`}
        >
          {score}
        </span>
      ) : null}
    </div>
  );
}

function MatchCell({
  match,
  placeholders,
  onClick,
}: {
  match?: Match;
  placeholders: [string, string];
  onClick?: () => void;
}) {
  const completed = match?.status === "completed";
  const homeWin = completed && !!match.winnerTeamId && match.winnerTeamId === match.homeTeamId;
  const awayWin = completed && !!match.winnerTeamId && match.winnerTeamId === match.awayTeamId;
  const homeLose = completed && !!match.winnerTeamId && awayWin;
  const awayLose = completed && !!match.winnerTeamId && homeWin;

  const dateLabel = match
    ? new Date(match.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "TBD";

  const isLive = match?.status === "live";
  const clickable = !!match && !!onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={`group w-full overflow-hidden rounded-xl border bg-white/[0.04] text-left shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all ${
        isLive
          ? "border-red-400/40 shadow-[0_0_24px_rgba(248,113,113,0.18)]"
          : completed
          ? "border-white/15 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(62,156,255,0.18)]"
          : "border-white/10"
      } ${clickable ? "cursor-pointer" : "cursor-default opacity-90"}`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 bg-white/[0.03] px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/50">
        <span>{match ? `Match ${match.matchNumber}` : "—"}</span>
        <span className={isLive ? "text-red-300" : ""}>
          {isLive ? "LIVE" : completed ? "FT" : dateLabel}
        </span>
      </div>
      <Slot
        team={match?.homeTeam}
        isWinner={homeWin}
        isLoser={homeLose}
        score={match?.homeScore}
        placeholder={placeholders[0]}
      />
      <div className="h-px bg-white/5" />
      <Slot
        team={match?.awayTeam}
        isWinner={awayWin}
        isLoser={awayLose}
        score={match?.awayScore}
        placeholder={placeholders[1]}
      />
    </button>
  );
}

// Official FIFA World Cup 2026 knockout pairings.
// Source: FIFA 2026 match schedule. Pairings are NOT sequential.
const PAIRINGS: Record<number, [number, number]> = {
  // Round of 16 (sources are R32 winners)
  89: [73, 75],
  90: [74, 77],
  91: [76, 78],
  92: [79, 80],
  93: [83, 84],
  94: [81, 82],
  95: [86, 88],
  96: [85, 87],
  // Quarter-finals (sources are R16 winners)
  97: [89, 90],
  98: [93, 94],
  99: [91, 92],
  100: [95, 96],
  // Semi-finals (sources are QF winners)
  101: [97, 98],
  102: [99, 100],
};

function prefixFor(srcMatchNumber: number): string {
  if (srcMatchNumber >= 73 && srcMatchNumber <= 88) return "R32";
  if (srcMatchNumber >= 89 && srcMatchNumber <= 96) return "R16";
  if (srcMatchNumber >= 97 && srcMatchNumber <= 100) return "QF";
  return "";
}

function placeholdersFor(matchNumber: number): [string, string] {
  if (matchNumber >= 73 && matchNumber <= 88) return ["TBD", "TBD"];
  if (matchNumber === 104) return ["Winner SF1", "Winner SF2"];
  if (matchNumber === 103) return ["Loser SF1", "Loser SF2"];
  const pair = PAIRINGS[matchNumber];
  if (!pair) return ["TBD", "TBD"];
  const [a, b] = pair;
  const px = prefixFor(a);
  return [`Winner ${px} M${a}`, `Winner ${px} M${b}`];
}

function BracketPage() {
  const matchesQ = useQuery({
    queryKey: ["matches", "all"],
    queryFn: () => api.get<Match[]>("/api/matches"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const byNumber = useMemo(() => {
    const m = new Map<number, Match>();
    (matchesQ.data || []).forEach((x) => {
      if (x.matchNumber >= 73 && x.matchNumber <= 104) {
        m.set(x.matchNumber, x);
      }
    });
    return m;
  }, [matchesQ.data]);

  const thirdPlace = byNumber.get(103);
  const [selected, setSelected] = useState<Match | null>(null);


  return (
    <SectionReveal delay={0.08} className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Knockout Bracket</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Round of 32 → Final. Slots auto-fill as each match is completed.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">
          <Trophy className="size-4 text-primary" />
          FIFA World Cup 2026
        </div>
      </div>

      {matchesQ.isLoading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
          Loading bracket…
        </div>
      ) : (
        <>
          {/* Horizontal scroller; bracket lays out as columns */}
          <div className="-mx-4 overflow-x-auto pb-4 sm:mx-0">
            <div className="flex min-w-[920px] gap-4 px-4 sm:min-w-[1100px] sm:gap-6 sm:px-0 lg:min-w-0">
              {COLUMNS.map((col) => {
                const [start, end] = col.range;
                const nums: number[] = [];
                for (let n = start; n <= end; n++) nums.push(n);
                return (
                  <div
                    key={col.key}
                    className="flex flex-1 flex-col"
                    style={{ minWidth: 180 }}
                  >
                    <div className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      {col.title}
                    </div>
                    <div className="flex flex-1 flex-col justify-around gap-3">
                      {nums.map((n) => {
                        const mm = byNumber.get(n);
                        return (
                          <MatchCell
                            key={n}
                            match={mm}
                            placeholders={placeholdersFor(n)}
                            onClick={mm ? () => setSelected(mm) : undefined}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Third place */}
          <div className="mt-8">
            <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Third Place Play-off
            </div>
            <div className="max-w-sm">
              <MatchCell
                match={thirdPlace}
                placeholders={placeholdersFor(103)}
                onClick={thirdPlace ? () => setSelected(thirdPlace) : undefined}
              />
            </div>
          </div>
        </>
      )}

      <MatchDetailsDialog match={selected} onClose={() => setSelected(null)} />
    </SectionReveal>
  );
}

function MatchDetailsDialog({
  match,
  onClose,
}: {
  match: Match | null;
  onClose: () => void;
}) {
  const open = !!match;
  const completed = match?.status === "completed";
  const homeWin = completed && match?.winnerTeamId === match?.homeTeamId;
  const awayWin = completed && match?.winnerTeamId === match?.awayTeamId;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border-white/10 bg-zinc-950/95 text-white">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            {match ? `${match.stage} — Match ${match.matchNumber}` : ""}
          </DialogTitle>
          <DialogDescription className="text-xs text-white/60">
            {match?.status === "live"
              ? `LIVE${match.liveMinute ? ` · ${match.liveMinute}'` : ""}`
              : match?.status === "completed"
              ? "Full time"
              : match?.status
              ? match.status.replace("_", " ")
              : ""}
          </DialogDescription>
        </DialogHeader>

        {match && (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <TeamBlock team={match.homeTeam} highlight={homeWin} dim={awayWin} align="left" />
              <div className="text-center">
                <div className="text-2xl font-black tabular-nums">
                  {typeof match.homeScore === "number" ? match.homeScore : "–"}
                  <span className="mx-2 text-white/30">:</span>
                  {typeof match.awayScore === "number" ? match.awayScore : "–"}
                </div>
                {match.isDraw && (
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-white/50">
                    Draw
                  </div>
                )}
              </div>
              <TeamBlock team={match.awayTeam} highlight={awayWin} dim={homeWin} align="right" />
            </div>

            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-white/40" />
                {new Date(match.date).toLocaleDateString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              {match.time && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-white/40" />
                  {match.time}
                </div>
              )}
              {(match.stadium || match.city) && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-white/40" />
                  {[match.stadium, match.city].filter(Boolean).join(", ")}
                </div>
              )}
              {match.group && (
                <div className="text-xs text-white/50">Group {match.group}</div>
              )}
            </div>

            {match.notes && (
              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-white/70">
                {match.notes}
              </div>
            )}

            {!completed && match.status !== "live" && (
              <div className="text-xs text-white/50">
                Result not available yet.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function TeamBlock({
  team,
  highlight,
  dim,
  align,
}: {
  team?: Team | null;
  highlight: boolean;
  dim: boolean;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse text-right" : ""} ${
        dim ? "opacity-40" : ""
      }`}
    >
      {team?.flag ? (
        <img
          src={team.flag}
          alt=""
          className={`size-8 shrink-0 rounded object-cover ${dim ? "grayscale" : ""}`}
        />
      ) : (
        <div className="size-8 shrink-0 rounded bg-white/10" />
      )}
      <div className="min-w-0">
        <div
          className={`truncate text-sm font-semibold ${
            highlight ? "text-white" : "text-white/80"
          }`}
        >
          {team?.name || "TBD"}
        </div>
        {highlight && (
          <div className="text-[10px] uppercase tracking-wider text-primary">
            Winner
          </div>
        )}
      </div>
    </div>
  );
}

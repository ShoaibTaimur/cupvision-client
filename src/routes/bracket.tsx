import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, Match, Team } from "@/lib/api";
import { BRACKET_PAIRINGS, bracketPrefixFor } from "@/lib/bracket";
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
  onHoverChange,
  isHighlighted,
  isDimmed,
}: {
  match?: Match;
  placeholders: [string, string];
  onClick?: () => void;
  onHoverChange?: (hovered: boolean) => void;
  isHighlighted?: boolean;
  isDimmed?: boolean;
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
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      onFocus={() => onHoverChange?.(true)}
      onBlur={() => onHoverChange?.(false)}
      disabled={!clickable}
      className={`group w-full overflow-hidden rounded-xl border bg-white/[0.04] text-left shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all ${
        isLive
          ? "border-red-400/40 shadow-[0_0_24px_rgba(248,113,113,0.18)]"
          : isHighlighted
          ? "border-sky-300/55 shadow-[0_0_28px_rgba(125,211,252,0.24)]"
          : completed
          ? "border-white/15 hover:border-primary/40 hover:shadow-[0_0_24px_rgba(62,156,255,0.18)]"
          : "border-white/10"
      } ${isDimmed ? "opacity-45" : ""} ${clickable ? "cursor-pointer" : "cursor-default opacity-90"}`}
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

const MATCH_CARD_HEIGHT = 120;
const MATCH_CARD_GAP = 20;
const MATCH_CENTER_Y = MATCH_CARD_HEIGHT / 2;
const HALF_COLUMN_MIN_WIDTH = 180;
const FINAL_COLUMN_MIN_WIDTH = 220;
const CONNECTOR_OFFSET = 10;
const LEFT_R32_ORDER = [73, 75, 74, 77, 83, 84, 81, 82] as const;
const RIGHT_R32_ORDER = [76, 78, 79, 80, 86, 88, 85, 87] as const;
const LEFT_R16_ORDER = [89, 90, 93, 94] as const;
const RIGHT_R16_ORDER = [91, 92, 95, 96] as const;
const LEFT_QF_ORDER = [97, 98] as const;
const RIGHT_QF_ORDER = [99, 100] as const;
const LEFT_SF_ORDER = [101] as const;
const RIGHT_SF_ORDER = [102] as const;

const LEFT_COLUMNS = [
  { key: "left-r32", title: "Round of 32", matches: [...LEFT_R32_ORDER] },
  { key: "left-r16", title: "Round of 16", matches: [...LEFT_R16_ORDER] },
  { key: "left-qf", title: "Quarter Finals", matches: [...LEFT_QF_ORDER] },
  { key: "left-sf", title: "Semi Finals", matches: [...LEFT_SF_ORDER] },
] as const;

const RIGHT_COLUMNS = [
  { key: "right-sf", title: "Semi Finals", matches: [...RIGHT_SF_ORDER] },
  { key: "right-qf", title: "Quarter Finals", matches: [...RIGHT_QF_ORDER] },
  { key: "right-r16", title: "Round of 16", matches: [...RIGHT_R16_ORDER] },
  { key: "right-r32", title: "Round of 32", matches: [...RIGHT_R32_ORDER] },
] as const;

function buildSidePositions(leafOrder: readonly number[], rounds: readonly (readonly number[])[]) {
  const positions = new Map<number, number>();

  leafOrder.forEach((matchNumber, index) => {
    positions.set(matchNumber, index * (MATCH_CARD_HEIGHT + MATCH_CARD_GAP));
  });

  const derivePositions = (matchNumbers: readonly number[]) => {
    matchNumbers.forEach((matchNumber) => {
      const pair = BRACKET_PAIRINGS[matchNumber];
      if (!pair) return;
      const a = positions.get(pair[0]);
      const b = positions.get(pair[1]);
      if (a == null || b == null) return;
      positions.set(matchNumber, (a + b) / 2);
    });
  };

  rounds.forEach((round) => derivePositions(round));
  return positions;
}

const LEFT_POSITIONS = buildSidePositions(LEFT_R32_ORDER, [
  LEFT_R16_ORDER,
  LEFT_QF_ORDER,
  LEFT_SF_ORDER,
]);
const RIGHT_POSITIONS = buildSidePositions(RIGHT_R32_ORDER, [
  RIGHT_R16_ORDER,
  RIGHT_QF_ORDER,
  RIGHT_SF_ORDER,
]);
const BRACKET_POSITIONS = new Map<number, number>([
  ...LEFT_POSITIONS.entries(),
  ...RIGHT_POSITIONS.entries(),
]);
const FINAL_TOP =
  ((BRACKET_POSITIONS.get(101) ?? 0) + (BRACKET_POSITIONS.get(102) ?? 0)) / 2;
const THIRD_PLACE_TOP = FINAL_TOP + MATCH_CARD_HEIGHT + MATCH_CARD_GAP + 28;
const BRACKET_HEIGHT =
  Math.max(...Array.from(BRACKET_POSITIONS.values()), FINAL_TOP, THIRD_PLACE_TOP, 0) +
  MATCH_CARD_HEIGHT;

type BracketConnector = {
  key: string;
  path: string;
  isCompleted: boolean;
  isLive: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
};

type ConnectorDirection = "left-to-right" | "right-to-left";

const CHILD_TO_PARENTS = BRACKET_PAIRINGS;
const PARENT_TO_CHILDREN = Object.entries(BRACKET_PAIRINGS).reduce<Record<number, number[]>>(
  (acc, [child, parents]) => {
    parents.forEach((parent) => {
      acc[parent] ??= [];
      acc[parent].push(Number(child));
    });
    return acc;
  },
  {},
);

function collectLineage(matchNumber: number) {
  const related = new Set<number>([matchNumber]);
  const queue = [matchNumber];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const parents = CHILD_TO_PARENTS[current] ?? [];
    const children = PARENT_TO_CHILDREN[current] ?? [];

    [...parents, ...children].forEach((next) => {
      if (related.has(next)) return;
      related.add(next);
      queue.push(next);
    });
  }

  return related;
}

const CONNECTOR_SOURCES: Array<[number, [number, number]]> = [
  ...Object.entries(BRACKET_PAIRINGS).map(([child, parents]) => [
    Number(child),
    parents as [number, number],
  ]),
  [104, [101, 102]],
];

function buildConnectorPath(startX: number, startY: number, endX: number, endY: number) {
  const midX = (startX + endX) / 2;
  return [
    `M ${startX} ${startY}`,
    `L ${midX} ${startY}`,
    `L ${midX} ${endY}`,
    `L ${endX} ${endY}`,
  ].join(" ");
}

function BracketConnectorLayer({
  width,
  height,
  connectors,
}: {
  width: number;
  height: number;
  connectors: BracketConnector[];
}) {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
      viewBox={`0 0 ${Math.max(width, 1)} ${height}`}
      preserveAspectRatio="xMinYMin meet"
    >
      {connectors.map((connector) => (
        <path
          key={connector.key}
          d={connector.path}
          fill="none"
          stroke={
            connector.isLive
              ? "rgba(248, 113, 113, 0.9)"
              : connector.isHighlighted
              ? "rgba(125, 211, 252, 0.92)"
              : connector.isCompleted
              ? "rgba(141, 220, 255, 0.72)"
              : connector.isDimmed
              ? "rgba(148, 163, 184, 0.16)"
              : "rgba(141, 220, 255, 0.42)"
          }
          strokeWidth={connector.isHighlighted || connector.isLive ? 3 : connector.isCompleted ? 2.5 : 2}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className={connector.isLive ? "animate-pulse" : "transition-all duration-200"}
          style={{
            filter:
              connector.isLive || connector.isHighlighted
                ? "drop-shadow(0 0 8px rgba(125, 211, 252, 0.35))"
                : undefined,
          }}
        />
      ))}
    </svg>
  );
}

// Official FIFA World Cup 2026 knockout pairings.
// Source: FIFA 2026 match schedule. Pairings are NOT sequential.
function placeholdersFor(matchNumber: number): [string, string] {
  if (matchNumber >= 73 && matchNumber <= 88) return ["TBD", "TBD"];
  if (matchNumber === 104) return ["Winner SF1", "Winner SF2"];
  if (matchNumber === 103) return ["Loser SF1", "Loser SF2"];
  const pair = BRACKET_PAIRINGS[matchNumber];
  if (!pair) return ["TBD", "TBD"];
  const [a, b] = pair;
  const px = bracketPrefixFor(a);
  return [`Winner ${px} M${a}`, `Winner ${px} M${b}`];
}

function BracketPage() {
  const bracketScrollRef = useRef<HTMLDivElement | null>(null);
  const [connectorWidth, setConnectorWidth] = useState(0);
  const [connectors, setConnectors] = useState<BracketConnector[]>([]);
  const [hoveredMatch, setHoveredMatch] = useState<number | null>(null);

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
  const hoveredLineage = useMemo(
    () => (hoveredMatch == null ? null : collectLineage(hoveredMatch)),
    [hoveredMatch],
  );

  useEffect(() => {
    const container = bracketScrollRef.current;
    if (!container) return;

    const rebuild = () => {
      const containerRect = container.getBoundingClientRect();
      setConnectorWidth(containerRect.width);
      const columnRects = new Map<string, { left: number; right: number }>();

      container.querySelectorAll<HTMLElement>("[data-bracket-column]").forEach((node) => {
        const key = node.dataset.bracketColumn;
        if (!key) return;
        const rect = node.getBoundingClientRect();
        columnRects.set(key, {
          left: rect.left - containerRect.left,
          right: rect.right - containerRect.left,
        });
      });

      const nextConnectors: BracketConnector[] = [];

      CONNECTOR_SOURCES.forEach(([child, parents]) => {
        const childColumn = [...LEFT_COLUMNS, ...RIGHT_COLUMNS, { key: "final", matches: [104] }].find((column) =>
          column.matches.includes(child),
        );
        if (!childColumn) return;

        const childRect = columnRects.get(childColumn.key);
        if (!childRect) return;

        parents.forEach((parent) => {
          const parentColumn = [...LEFT_COLUMNS, ...RIGHT_COLUMNS].find((column) =>
            column.matches.includes(parent),
          );
          if (!parentColumn) return;

          const parentRect = columnRects.get(parentColumn.key);
          const parentTop = BRACKET_POSITIONS.get(parent);
          const childTop = child === 104 ? FINAL_TOP : BRACKET_POSITIONS.get(child);
          const parentMatch = byNumber.get(parent);
          const childMatch = byNumber.get(child);
          if (!parentRect || parentTop == null || childTop == null) return;

          const direction: ConnectorDirection = parentColumn.key.startsWith("right")
            ? "right-to-left"
            : "left-to-right";

          const startX =
            direction === "left-to-right"
              ? parentRect.right + CONNECTOR_OFFSET
              : parentRect.left - CONNECTOR_OFFSET;
          const endX =
            direction === "left-to-right"
              ? childRect.left - CONNECTOR_OFFSET
              : childRect.right + CONNECTOR_OFFSET;

          nextConnectors.push({
            key: `${parent}-${child}`,
            path: buildConnectorPath(
              startX,
              parentTop + MATCH_CENTER_Y,
              endX,
              childTop + MATCH_CENTER_Y,
            ),
            isCompleted: parentMatch?.status === "completed",
            isLive: parentMatch?.status === "live" || childMatch?.status === "live",
            isHighlighted:
              hoveredLineage != null && hoveredLineage.has(parent) && hoveredLineage.has(child),
            isDimmed:
              hoveredLineage != null && (!hoveredLineage.has(parent) || !hoveredLineage.has(child)),
          });
        });
      });

      setConnectors(nextConnectors);
    };

    rebuild();

    const observer = new ResizeObserver(rebuild);
    observer.observe(container);
    container.querySelectorAll<HTMLElement>("[data-bracket-column]").forEach((node) => {
      observer.observe(node);
    });

    window.addEventListener("resize", rebuild);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", rebuild);
    };
  }, [byNumber, hoveredLineage]);

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
            <div
              ref={bracketScrollRef}
              className="relative min-w-[1460px] px-4 sm:px-0"
              style={{ minHeight: BRACKET_HEIGHT }}
            >
              <BracketConnectorLayer
                width={connectorWidth}
                height={BRACKET_HEIGHT}
                connectors={connectors}
              />
              <div className="relative z-10 flex items-start gap-8">
                <BracketHalf
                  columns={LEFT_COLUMNS}
                  byNumber={byNumber}
                  hoveredLineage={hoveredLineage}
                  onHoverChange={setHoveredMatch}
                  onSelect={setSelected}
                />
                <div
                  data-bracket-column="final"
                  className="flex flex-col"
                  style={{ minWidth: FINAL_COLUMN_MIN_WIDTH }}
                >
                  <div className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                    Final
                  </div>
                  <div className="relative" style={{ height: BRACKET_HEIGHT }}>
                    <div className="absolute inset-x-0" style={{ top: FINAL_TOP }}>
                      <MatchCell
                        match={byNumber.get(104)}
                        placeholders={placeholdersFor(104)}
                        onClick={byNumber.get(104) ? () => setSelected(byNumber.get(104) ?? null) : undefined}
                        onHoverChange={(hovered) => setHoveredMatch(hovered ? 104 : null)}
                        isHighlighted={hoveredLineage?.has(104) ?? false}
                        isDimmed={hoveredLineage != null && !(hoveredLineage?.has(104) ?? false)}
                      />
                    </div>
                    <div className="absolute inset-x-0" style={{ top: THIRD_PLACE_TOP }}>
                      <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                        Third Place
                      </div>
                      <MatchCell
                        match={thirdPlace}
                        placeholders={placeholdersFor(103)}
                        onClick={thirdPlace ? () => setSelected(thirdPlace) : undefined}
                        onHoverChange={(hovered) => setHoveredMatch(hovered ? 103 : null)}
                        isHighlighted={hoveredLineage?.has(103) ?? false}
                        isDimmed={hoveredLineage != null && !(hoveredLineage?.has(103) ?? false)}
                      />
                    </div>
                  </div>
                </div>
                <BracketHalf
                  columns={RIGHT_COLUMNS}
                  byNumber={byNumber}
                  hoveredLineage={hoveredLineage}
                  onHoverChange={setHoveredMatch}
                  onSelect={setSelected}
                />
              </div>
            </div>
          </div>
        </>
      )}

      <MatchDetailsDialog match={selected} onClose={() => setSelected(null)} />
    </SectionReveal>
  );
}

function BracketHalf({
  columns,
  byNumber,
  hoveredLineage,
  onHoverChange,
  onSelect,
}: {
  columns: ReadonlyArray<{ key: string; title: string; matches: number[] }>;
  byNumber: Map<number, Match>;
  hoveredLineage: Set<number> | null;
  onHoverChange: (matchNumber: number | null) => void;
  onSelect: (match: Match | null) => void;
}) {
  return (
    <div className="flex gap-4 sm:gap-6">
      {columns.map((col) => (
        <div
          key={col.key}
          data-bracket-column={col.key}
          className="flex flex-col"
          style={{ minWidth: HALF_COLUMN_MIN_WIDTH }}
        >
          <div className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            {col.title}
          </div>
          <div className="relative" style={{ height: BRACKET_HEIGHT }}>
            {col.matches.map((n) => {
              const mm = byNumber.get(n);
              const isHighlighted = hoveredLineage?.has(n) ?? false;
              const isDimmed = hoveredLineage != null && !isHighlighted;
              return (
                <div
                  key={n}
                  className="absolute inset-x-0"
                  style={{ top: BRACKET_POSITIONS.get(n) ?? 0 }}
                >
                  <MatchCell
                    match={mm}
                    placeholders={placeholdersFor(n)}
                    onClick={mm ? () => onSelect(mm) : undefined}
                    onHoverChange={(hovered) => onHoverChange(hovered ? n : null)}
                    isHighlighted={isHighlighted}
                    isDimmed={isDimmed}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
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
              {typeof match.homePenaltyScore === "number" &&
              typeof match.awayPenaltyScore === "number" ? (
                <div className="mt-1 text-[10px] uppercase tracking-wider text-white/50">
                  Pens {match.homePenaltyScore} - {match.awayPenaltyScore}
                </div>
              ) : null}
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

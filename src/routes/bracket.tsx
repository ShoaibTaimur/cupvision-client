import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { api, BracketMatch, BracketResponse, Team } from "@/lib/api";
import { SectionReveal } from "@/components/section-reveal";
import { Trophy, MapPin, Calendar, Clock } from "lucide-react";
import { formatMatchDate, formatMatchTime } from "@/lib/date";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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

const MATCH_CARD_HEIGHT = 120;
const MATCH_CARD_GAP = 20;
const MATCH_CENTER_Y = MATCH_CARD_HEIGHT / 2;
const HALF_COLUMN_MIN_WIDTH = 180;
const FINAL_COLUMN_MIN_WIDTH = 220;
const CONNECTOR_OFFSET = 10;

type BracketConnector = {
  key: string;
  path: string;
  isCompleted: boolean;
  isLive: boolean;
  isHighlighted: boolean;
  isDimmed: boolean;
};

function teamLabel(t?: Team | null, fallback = "TBD") {
  if (!t) return fallback;
  if (!t.name || t.name === "TBD") return fallback;
  return t.name;
}

function hasTeam(match?: BracketMatch) {
  if (!match) return false;
  const hasHome = match.homeTeam && match.homeTeam.name && match.homeTeam.name !== "TBD";
  const hasAway = match.awayTeam && match.awayTeam.name && match.awayTeam.name !== "TBD";
  return !!(hasHome || hasAway);
}

function buildConnectorPath(startX: number, startY: number, endX: number, endY: number) {
  const midX = (startX + endX) / 2;
  return [
    `M ${startX} ${startY}`,
    `L ${midX} ${startY}`,
    `L ${midX} ${endY}`,
    `L ${endX} ${endY}`,
  ].join(" ");
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
  match?: BracketMatch;
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

  const dateLabel = match ? formatMatchDate(match.date, match.time, "MMM D") : "TBD";

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
          strokeWidth={
            connector.isHighlighted || connector.isLive ? 3 : connector.isCompleted ? 2.5 : 2
          }
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

function BracketPage() {
  const bracketScrollRef = useRef<HTMLDivElement | null>(null);
  const [connectorWidth, setConnectorWidth] = useState(0);
  const [connectors, setConnectors] = useState<BracketConnector[]>([]);
  const [hoveredMatch, setHoveredMatch] = useState<number | null>(null);
  const [selected, setSelected] = useState<BracketMatch | null>(null);

  const bracketQ = useQuery({
    queryKey: ["bracket"],
    queryFn: () => api.get<BracketResponse>("/api/bracket"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const leftColumns = useMemo(
    () => [
      { key: "left-r32", title: "Round of 32", matches: bracketQ.data?.columns.left.r32 || [] },
      { key: "left-r16", title: "Round of 16", matches: bracketQ.data?.columns.left.r16 || [] },
      { key: "left-qf", title: "Quarter Finals", matches: bracketQ.data?.columns.left.qf || [] },
      { key: "left-sf", title: "Semi Finals", matches: bracketQ.data?.columns.left.sf || [] },
    ],
    [bracketQ.data],
  );
  const rightColumns = useMemo(
    () => [
      { key: "right-sf", title: "Semi Finals", matches: bracketQ.data?.columns.right.sf || [] },
      { key: "right-qf", title: "Quarter Finals", matches: bracketQ.data?.columns.right.qf || [] },
      { key: "right-r16", title: "Round of 16", matches: bracketQ.data?.columns.right.r16 || [] },
      { key: "right-r32", title: "Round of 32", matches: bracketQ.data?.columns.right.r32 || [] },
    ],
    [bracketQ.data],
  );

  const byNumber = useMemo(() => {
    const map = new Map<number, BracketMatch>();
    (bracketQ.data?.matches || []).forEach((row) => map.set(row.matchNumber, row));
    return map;
  }, [bracketQ.data]);

  const pairings = useMemo(() => {
    const map: Record<number, [number, number]> = {};
    (bracketQ.data?.matches || []).forEach((row) => {
      const homeFrom = row.homeSeed?.fromMatchNumber;
      const awayFrom = row.awaySeed?.fromMatchNumber;
      if (homeFrom && awayFrom) {
        map[row.matchNumber] = [homeFrom, awayFrom];
      }
    });
    return map;
  }, [bracketQ.data]);

  const childToParents = pairings;
  const parentToChildren = useMemo(
    () =>
      Object.entries(pairings).reduce<Record<number, number[]>>((acc, [child, parents]) => {
        parents.forEach((parent) => {
          acc[parent] ??= [];
          acc[parent].push(Number(child));
        });
        return acc;
      }, {}),
    [pairings],
  );

  const leftR32Order = leftColumns[0].matches.map((match) => match.matchNumber);
  const rightR32Order = rightColumns[3].matches.map((match) => match.matchNumber);
  const leftR16Order = leftColumns[1].matches.map((match) => match.matchNumber);
  const rightR16Order = rightColumns[2].matches.map((match) => match.matchNumber);
  const leftQfOrder = leftColumns[2].matches.map((match) => match.matchNumber);
  const rightQfOrder = rightColumns[1].matches.map((match) => match.matchNumber);
  const leftSfOrder = leftColumns[3].matches.map((match) => match.matchNumber);
  const rightSfOrder = rightColumns[0].matches.map((match) => match.matchNumber);

  const buildSidePositions = (
    leafOrder: readonly number[],
    rounds: readonly (readonly number[])[],
  ) => {
    const positions = new Map<number, number>();

    leafOrder.forEach((matchNumber, index) => {
      positions.set(matchNumber, index * (MATCH_CARD_HEIGHT + MATCH_CARD_GAP));
    });

    rounds.forEach((round) => {
      round.forEach((matchNumber) => {
        const pair = pairings[matchNumber];
        if (!pair) return;
        const a = positions.get(pair[0]);
        const b = positions.get(pair[1]);
        if (a == null || b == null) return;
        positions.set(matchNumber, (a + b) / 2);
      });
    });

    return positions;
  };

  const leftPositions = useMemo(
    () => buildSidePositions(leftR32Order, [leftR16Order, leftQfOrder, leftSfOrder]),
    [leftR32Order.join(","), leftR16Order.join(","), leftQfOrder.join(","), leftSfOrder.join(","), bracketQ.data],
  );
  const rightPositions = useMemo(
    () => buildSidePositions(rightR32Order, [rightR16Order, rightQfOrder, rightSfOrder]),
    [rightR32Order.join(","), rightR16Order.join(","), rightQfOrder.join(","), rightSfOrder.join(","), bracketQ.data],
  );
  const bracketPositions = useMemo(
    () => new Map<number, number>([...leftPositions.entries(), ...rightPositions.entries()]),
    [leftPositions, rightPositions],
  );
  const finalMatch = bracketQ.data?.columns.center.final[0] || null;
  const thirdPlace = bracketQ.data?.columns.center.third[0] || null;
  const finalTop =
    ((leftSfOrder[0] ? bracketPositions.get(leftSfOrder[0]) ?? 0 : 0) +
      (rightSfOrder[0] ? bracketPositions.get(rightSfOrder[0]) ?? 0 : 0)) /
    2;
  const thirdPlaceTop = finalTop + MATCH_CARD_HEIGHT + MATCH_CARD_GAP + 28;
  const bracketHeight =
    Math.max(...Array.from(bracketPositions.values()), finalTop, thirdPlaceTop, 0) +
    MATCH_CARD_HEIGHT;

  const hoverHighlight = useMemo(() => {
    if (hoveredMatch == null) {
      return null;
    }

    const matches = new Set<number>([hoveredMatch]);
    const connectors = new Set<string>();

    const parents = pairings[hoveredMatch];
    if (parents && parents.length > 0) {
      const queue = [...parents];
      parents.forEach((p) => {
        matches.add(p);
        connectors.add(`${p}-${hoveredMatch}`);
      });

      while (queue.length > 0) {
        const current = queue.shift()!;
        const currParents = pairings[current];
        if (currParents) {
          currParents.forEach((p) => {
            if (!matches.has(p)) {
              matches.add(p);
              connectors.add(`${p}-${current}`);
              queue.push(p);
            }
          });
        }
      }
    } else {
      const matchObj = byNumber.get(hoveredMatch);
      if (matchObj && matchObj.status === "completed") {
        const children = parentToChildren[hoveredMatch] || [];
        children.forEach((c) => {
          matches.add(c);
          connectors.add(`${hoveredMatch}-${c}`);
        });
      }
    }

    if (connectors.size === 0) {
      return null;
    }

    return { matches, connectors };
  }, [hoveredMatch, pairings, parentToChildren, byNumber]);

  const connectorSources = useMemo<[number, [number, number]][]>(
    () =>
      Object.entries(pairings)
        .filter(([child]) => byNumber.get(Number(child))?.bracket.roundKey !== "third")
        .map(([child, parents]) => [Number(child), parents]),
    [byNumber, pairings],
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
      const allColumns = [...leftColumns, ...rightColumns, { key: "final", matches: finalMatch ? [finalMatch] : [] }];

      connectorSources.forEach(([child, parents]) => {
        const childColumn = allColumns.find((column) =>
          column.matches.some((match) => match.matchNumber === child),
        );
        if (!childColumn) return;
        const childRect = columnRects.get(childColumn.key);
        if (!childRect) return;

        parents.forEach((parent) => {
          const parentColumn = [...leftColumns, ...rightColumns].find((column) =>
            column.matches.some((match) => match.matchNumber === parent),
          );
          if (!parentColumn) return;

          const parentRect = columnRects.get(parentColumn.key);
          const parentTop = bracketPositions.get(parent);
          const childTop = child === finalMatch?.matchNumber ? finalTop : bracketPositions.get(child);
          const parentMatch = byNumber.get(parent);
          const childMatch = byNumber.get(child);
          if (!parentRect || parentTop == null || childTop == null) return;

          const direction = parentColumn.key.startsWith("right") ? "right-to-left" : "left-to-right";
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
            path: buildConnectorPath(startX, parentTop + MATCH_CENTER_Y, endX, childTop + MATCH_CENTER_Y),
            isCompleted: parentMatch?.status === "completed",
            isLive: parentMatch?.status === "live" || childMatch?.status === "live",
            isHighlighted:
              hoverHighlight != null && hoverHighlight.connectors.has(`${parent}-${child}`),
            isDimmed:
              hoverHighlight != null && !hoverHighlight.connectors.has(`${parent}-${child}`),
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
  }, [bracketPositions, connectorSources, finalMatch, finalTop, hoverHighlight, leftColumns, rightColumns, byNumber]);

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

      {bracketQ.isLoading ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-sm text-white/60">
          Loading bracket…
        </div>
      ) : (
        <div className="-mx-4 overflow-x-auto pb-4 sm:mx-0">
          <div
            ref={bracketScrollRef}
            className="relative min-w-[1460px] px-4 sm:px-0"
            style={{ minHeight: bracketHeight }}
          >
            <BracketConnectorLayer
              width={connectorWidth}
              height={bracketHeight}
              connectors={connectors}
            />
            <div className="relative z-10 flex items-start gap-8">
              <BracketHalf
                columns={leftColumns}
                positions={bracketPositions}
                height={bracketHeight}
                hoverHighlight={hoverHighlight}
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
                <div className="relative" style={{ height: bracketHeight }}>
                  <div className="absolute inset-x-0" style={{ top: finalTop }}>
                    <MatchCell
                      match={finalMatch || undefined}
                      placeholders={[
                        finalMatch?.homePlaceholder || "TBD",
                        finalMatch?.awayPlaceholder || "TBD",
                      ]}
                      onClick={finalMatch ? () => setSelected(finalMatch) : undefined}
                      onHoverChange={(hovered) => {
                        if (hovered && finalMatch && !hasTeam(finalMatch)) {
                          setHoveredMatch(null);
                          return;
                        }
                        setHoveredMatch(hovered && finalMatch ? finalMatch.matchNumber : null);
                      }}
                      isHighlighted={finalMatch && hoverHighlight ? hoverHighlight.matches.has(finalMatch.matchNumber) : false}
                      isDimmed={
                        hoverHighlight != null &&
                        (!finalMatch || !hoverHighlight.matches.has(finalMatch.matchNumber))
                      }
                    />
                  </div>
                  <div className="absolute inset-x-0" style={{ top: thirdPlaceTop }}>
                    <div className="mb-2 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                      Third Place
                    </div>
                    <MatchCell
                      match={thirdPlace || undefined}
                      placeholders={[
                        thirdPlace?.homePlaceholder || "TBD",
                        thirdPlace?.awayPlaceholder || "TBD",
                      ]}
                      onClick={thirdPlace ? () => setSelected(thirdPlace) : undefined}
                      onHoverChange={(hovered) => {
                        if (hovered && thirdPlace && !hasTeam(thirdPlace)) {
                          setHoveredMatch(null);
                          return;
                        }
                        setHoveredMatch(hovered && thirdPlace ? thirdPlace.matchNumber : null);
                      }}
                      isHighlighted={thirdPlace && hoverHighlight ? hoverHighlight.matches.has(thirdPlace.matchNumber) : false}
                      isDimmed={
                        hoverHighlight != null &&
                        (!thirdPlace || !hoverHighlight.matches.has(thirdPlace.matchNumber))
                      }
                    />
                  </div>
                </div>
              </div>
              <BracketHalf
                columns={rightColumns}
                positions={bracketPositions}
                height={bracketHeight}
                hoverHighlight={hoverHighlight}
                onHoverChange={setHoveredMatch}
                onSelect={setSelected}
              />
            </div>
          </div>
        </div>
      )}

      <MatchDetailsDialog match={selected} onClose={() => setSelected(null)} />
    </SectionReveal>
  );
}

function BracketHalf({
  columns,
  positions,
  height,
  hoverHighlight,
  onHoverChange,
  onSelect,
}: {
  columns: ReadonlyArray<{ key: string; title: string; matches: BracketMatch[] }>;
  positions: Map<number, number>;
  height: number;
  hoverHighlight: { matches: Set<number>; connectors: Set<string> } | null;
  onHoverChange: (matchNumber: number | null) => void;
  onSelect: (match: BracketMatch | null) => void;
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
          <div className="relative" style={{ height }}>
            {col.matches.map((match) => {
              const isHighlighted = hoverHighlight != null && hoverHighlight.matches.has(match.matchNumber);
              const isDimmed = hoverHighlight != null && !isHighlighted;
              return (
                <div
                  key={match.matchNumber}
                  className="absolute inset-x-0"
                  style={{ top: positions.get(match.matchNumber) ?? 0 }}
                >
                  <MatchCell
                    match={match}
                    placeholders={[match.homePlaceholder, match.awayPlaceholder]}
                    onClick={() => onSelect(match)}
                    onHoverChange={(hovered) => {
                      if (hovered && !hasTeam(match)) {
                        onHoverChange(null);
                        return;
                      }
                      onHoverChange(hovered ? match.matchNumber : null);
                    }}
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
  match: BracketMatch | null;
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
              ? "LIVE"
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
              </div>
              <TeamBlock team={match.awayTeam} highlight={awayWin} dim={homeWin} align="right" />
            </div>

            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-white/40" />
                {formatMatchDate(match.date, match.time, "ddd, MMM D, YYYY")}
              </div>
              {match.time && (
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-white/40" />
                  {formatMatchTime(match.date, match.time)}
                </div>
              )}
              {(match.stadium || match.city) && (
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-white/40" />
                  {[match.stadium, match.city].filter(Boolean).join(", ")}
                </div>
              )}
              {match.group && <div className="text-xs text-white/50">Group {match.group}</div>}
            </div>
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
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Clock3, MapPin, Radio, Tv2 } from "lucide-react";
import { api, Match } from "@/lib/api";
import { TeamFlag } from "@/components/match-card";
import { formatMatchDate, formatMatchTime } from "@/lib/date";
import { formatScoreValue } from "@/lib/match-score";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function FloatingLiveBadge() {
  const [open, setOpen] = useState(false);
  const liveQ = useQuery({
    queryKey: ["matches", "live", "floating-badge"],
    queryFn: () => api.get<Match[]>("/api/matches/live"),
    refetchInterval: 25_000,
    refetchIntervalInBackground: false,
    staleTime: 10_000,
    refetchOnWindowFocus: false,
  });

  const liveMatches = (liveQ.data || []).filter((m) => m.status === "live" || m.status === "awaiting_result");
  const lead = liveMatches[0];

  if (!lead) return null;

  const minute = lead.liveMinute ? `${lead.liveMinute}'` : lead.liveStatusLabel || "LIVE";
  const extraCount = liveMatches.length > 1 ? ` +${liveMatches.length - 1}` : "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-4 z-50 max-w-[calc(100vw-2rem)] rounded-2xl border border-red-400/30 bg-zinc-950/88 px-4 py-3 text-left text-white shadow-[0_22px_50px_rgba(0,0,0,0.34)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-red-300/45 sm:bottom-6 sm:left-6 sm:max-w-sm"
      >
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-red-300">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
            <span className="relative inline-flex size-2 rounded-full bg-red-400" />
          </span>
          Live match{liveMatches.length > 1 ? "es" : ""}
          <span className="rounded-full border border-red-400/25 bg-red-500/10 px-2 py-0.5 text-[9px] text-red-200">
            {minute}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-black tracking-tight">
              {lead.homeTeam?.name || "TBD"} vs {lead.awayTeam?.name || "TBD"}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs text-zinc-300">
              <span className="rounded-full border border-red-400/25 bg-red-500/12 px-2.5 py-0.5 font-bold tabular-nums text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.28)]">
                {formatScoreValue(lead.homeScore, lead.homePenaltyScore)}
              </span>
              <span className="text-white/35">-</span>
              <span className="rounded-full border border-red-400/25 bg-red-500/12 px-2.5 py-0.5 font-bold tabular-nums text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.28)]">
                {formatScoreValue(lead.awayScore, lead.awayPenaltyScore)}
              </span>
              <span className="truncate">{lead.stage}{extraCount}</span>
            </div>
          </div>
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-red-400/20 bg-red-500/10 text-red-200">
            <Tv2 className="size-5" />
          </div>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto border-white/10 bg-zinc-950/96 text-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Radio className="size-4 text-red-300" />
              Ongoing matches
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Live score, stage, venue, kickoff info.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {liveMatches.map((match) => {
              const liveLabel = match.liveMinute
                ? `${match.liveMinute}'`
                : match.liveStatusLabel || match.status.replace("_", " ");

              return (
                <div
                  key={match._id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/45">
                      Match #{match.matchNumber} · {match.stage}
                      {match.group ? ` · Group ${match.group}` : ""}
                    </div>
                    <div className="rounded-full border border-red-400/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-red-200">
                      {liveLabel}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <LiveRow
                      teamName={match.homeTeam?.name || "TBD"}
                      team={match.homeTeam}
                      score={formatScoreValue(match.homeScore, match.homePenaltyScore)}
                    />
                    <LiveRow
                      teamName={match.awayTeam?.name || "TBD"}
                      team={match.awayTeam}
                      score={formatScoreValue(match.awayScore, match.awayPenaltyScore)}
                    />
                  </div>

                  <div className="mt-4 grid gap-2 text-xs text-white/65 sm:grid-cols-3">
                    <div className="inline-flex items-center gap-2">
                      <Clock3 className="size-3.5 text-primary" />
                      {formatMatchDate(match.date, match.time)} · {formatMatchTime(match.date, match.time)}
                    </div>
                    <div className="inline-flex items-center gap-2 sm:col-span-2">
                      <MapPin className="size-3.5 text-primary" />
                      {[match.stadium, match.city].filter(Boolean).join(", ")}
                    </div>
                  </div>

                  {match.notes ? (
                    <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-xs text-white/60">
                      {match.notes}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function LiveRow({
  team,
  teamName,
  score,
}: {
  team?: Match["homeTeam"];
  teamName: string;
  score: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/7 bg-black/20 px-3 py-3">
      <TeamFlag team={team} className="size-8" />
      <div className="min-w-0 flex-1 truncate text-sm font-bold">{teamName}</div>
      <div className="rounded-xl border border-red-400/25 bg-red-500/12 px-3 py-1 text-sm font-black tabular-nums text-red-100 shadow-[0_0_18px_rgba(248,113,113,0.3)]">
        {score}
      </div>
    </div>
  );
}

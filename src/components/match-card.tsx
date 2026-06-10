import { Match, Team } from "@/lib/api";
import { Calendar, Clock, MapPin } from "lucide-react";
import { formatDate, formatTime } from "@/lib/date";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-secondary text-secondary-foreground border border-white/5",
  live: "bg-accent/20 text-accent border border-accent/30 animate-pulse",
  awaiting_result: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20",
  completed: "bg-primary/10 text-primary border border-primary/20",
  cancelled: "bg-destructive/10 text-destructive border border-destructive/20",
  postponed: "bg-muted text-muted-foreground border border-white/5",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-extrabold ${STATUS_STYLES[status] || "bg-muted text-muted-foreground"}`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function TeamFlag({ team }: { team?: Team | null }) {
  if (!team) {
    return (
      <div className="size-6 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-muted-foreground select-none">
        ?
      </div>
    );
  }
  const flag = team.flag?.trim();
  if (!flag) {
    return (
      <div className="size-6 shrink-0 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary select-none uppercase">
        {team.name ? team.name[0] : "?"}
      </div>
    );
  }
  // If it's a URL
  if (flag.startsWith("http") || flag.startsWith("/") || flag.includes(".")) {
    return (
      <img
        src={flag}
        className="size-6 shrink-0 object-cover rounded-full border border-white/10 shadow-sm"
        alt={team.name}
      />
    );
  }
  // Otherwise treat as emoji
  return (
    <span className="text-lg select-none leading-none shrink-0" role="img" aria-label={team.name}>
      {flag}
    </span>
  );
}

function DateTimePill({ date, time }: { date: string; time: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/50 border border-white/5 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm">
      <Calendar className="size-3 text-primary/70" />
      <span>{formatDate(date)}</span>
      <span className="size-1 rounded-full bg-white/20" />
      <Clock className="size-3 text-accent/70" />
      <span>{formatTime(time)}</span>
    </div>
  );
}

export function MatchCard({ m, onClick }: { m: Match; onClick?: () => void }) {
  const home = m.homeTeam?.name || "TBD";
  const away = m.awayTeam?.name || "TBD";
  const completed = m.status === "completed";
  const live = m.status === "live";

  return (
    <button
      onClick={onClick}
      className={`text-left w-full bg-card/45 border rounded-2xl p-4 transition-all duration-300 relative overflow-hidden group select-none ${
        live
          ? "border-accent/40 bg-accent/5 hover:border-accent/60 shadow-lg shadow-accent/5"
          : "border-border/60 hover:border-primary/40 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99]"
      }`}
    >
      {/* Background card accent light */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3 border-b border-white/5 pb-2">
        <span className="flex items-center gap-1.5 opacity-80">
          Match #{m.matchNumber} · {m.stage}
          {m.group ? ` · Group ${m.group}` : ""}
        </span>
        <StatusBadge status={m.status} />
      </div>

      {/* Core Teams Stacked Column-wise */}
      <div className="flex flex-col gap-2.5 py-1">
        {/* Home Team Row */}
        <div className="flex items-center gap-3">
          <TeamFlag team={m.homeTeam} />
          <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {home}
          </span>
          {completed && (
            <span className="ml-auto font-black text-xs tabular-nums text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
              {m.homeScore ?? 0}
            </span>
          )}
          {live && (
            <span className="ml-auto font-black text-xs tabular-nums text-accent bg-accent/15 border border-accent/25 px-2 py-0.5 rounded-md animate-pulse">
              {m.homeScore ?? 0}
            </span>
          )}
        </div>

        {/* Separator VS (only for scheduled or pending matches) */}
        {!completed && !live && (
          <div className="flex items-center gap-2 pl-[36px]">
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/45">
              VS
            </span>
            <div className="h-[1px] flex-1 bg-white/5" />
          </div>
        )}

        {/* Away Team Row */}
        <div className="flex items-center gap-3">
          <TeamFlag team={m.awayTeam} />
          <span className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
            {away}
          </span>
          {completed && (
            <span className="ml-auto font-black text-xs tabular-nums text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
              {m.awayScore ?? 0}
            </span>
          )}
          {live && (
            <span className="ml-auto font-black text-xs tabular-nums text-accent bg-accent/15 border border-accent/25 px-2 py-0.5 rounded-md animate-pulse">
              {m.awayScore ?? 0}
            </span>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between gap-3 flex-wrap">
        <DateTimePill date={m.date} time={m.time} />
        <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground truncate opacity-85">
          <MapPin className="size-3.5 text-primary/70" /> {m.stadium}, {m.city}
        </span>
      </div>
    </button>
  );
}

export function LiveMatchCard({ m, onClick }: { m: Match; onClick?: () => void }) {
  const home = m.homeTeam?.name || "TBD";
  const away = m.awayTeam?.name || "TBD";

  return (
    <button
      onClick={onClick}
      className="relative text-left w-full rounded-2xl p-[1px] bg-gradient-to-br from-accent via-primary to-accent overflow-hidden group select-none transition-all active:scale-[0.99]"
    >
      {/* Animated glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-accent/50 via-primary/50 to-accent/50 blur-2xl opacity-40 group-hover:opacity-75 transition-opacity pointer-events-none duration-500" />

      <div className="relative rounded-[15px] bg-card/95 backdrop-blur-md p-5 border border-white/5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
              Live now
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Match #{m.matchNumber} · {m.stage}
            {m.group ? ` · Group ${m.group}` : ""}
          </span>
        </div>

        {/* Teams Stacked Column-wise */}
        <div className="flex flex-col gap-3 py-1">
          {/* Home */}
          <div className="flex items-center gap-3">
            <TeamFlag team={m.homeTeam} />
            <span className="text-base font-black tracking-tight text-white truncate">{home}</span>
            <span className="ml-auto font-black text-lg tabular-nums text-accent bg-accent/15 border border-accent/25 px-3 py-1 rounded-xl animate-pulse shadow-sm">
              {m.homeScore ?? 0}
            </span>
          </div>

          {/* Separator / Versus */}
          <div className="flex items-center gap-2 pl-[36px]">
            <span className="text-[9px] font-black uppercase tracking-widest text-accent/60">
              LIVE
            </span>
            <div className="h-[1px] flex-1 bg-accent/20" />
          </div>

          {/* Away */}
          <div className="flex items-center gap-3">
            <TeamFlag team={m.awayTeam} />
            <span className="text-base font-black tracking-tight text-white truncate">{away}</span>
            <span className="ml-auto font-black text-lg tabular-nums text-accent bg-accent/15 border border-accent/25 px-3 py-1 rounded-xl animate-pulse shadow-sm">
              {m.awayScore ?? 0}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between gap-3 flex-wrap">
          <DateTimePill date={m.date} time={m.time} />
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground truncate opacity-85">
            <MapPin className="size-3.5 text-accent/80" /> {m.stadium}, {m.city}
          </span>
        </div>
      </div>
    </button>
  );
}

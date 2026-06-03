import { Match } from "@/lib/api";
import { Calendar, Clock, MapPin } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  scheduled: "bg-secondary text-secondary-foreground",
  live: "bg-accent text-accent-foreground animate-pulse",
  awaiting_result: "bg-yellow-500/20 text-yellow-300",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive-foreground",
  postponed: "bg-muted text-muted-foreground",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-medium ${STATUS_STYLES[status] || "bg-muted"}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function DateTimePill({ date, time }: { date: string; time: string }) {
  return (
    <div className="inline-flex items-stretch rounded-md overflow-hidden border border-primary/30 text-[11px] font-semibold">
      <span className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary">
        <Calendar className="size-3" /> {date}
      </span>
      <span className="flex items-center gap-1 px-2 py-1 bg-accent/15 text-accent">
        <Clock className="size-3" /> {time}
      </span>
    </div>
  );
}

export function MatchCard({ m, onClick }: { m: Match; onClick?: () => void }) {
  const home = m.homeTeam?.name || "TBD";
  const away = m.awayTeam?.name || "TBD";
  const completed = m.status === "completed";
  return (
    <button
      onClick={onClick}
      className="text-left w-full bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:bg-card/80 transition-all"
    >
      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
        <span>Match #{m.matchNumber} · {m.stage}{m.group ? ` · Group ${m.group}` : ""}</span>
        <StatusBadge status={m.status} />
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="text-right">
          <div className="font-semibold truncate">{home}</div>
        </div>
        <div className="flex items-center gap-2 text-lg font-bold tabular-nums">
          {completed ? (
            <>
              <span>{m.homeScore ?? 0}</span>
              <span className="text-muted-foreground text-sm">vs</span>
              <span>{m.awayScore ?? 0}</span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground font-medium">vs</span>
          )}
        </div>
        <div>
          <div className="font-semibold truncate">{away}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
        <DateTimePill date={m.date} time={m.time} />
        <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
          <MapPin className="size-3" /> {m.stadium}, {m.city}
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
      className="relative text-left w-full rounded-xl p-[1.5px] bg-gradient-to-br from-accent via-primary to-accent overflow-hidden group"
    >
      {/* animated glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity" />
      <div className="relative rounded-[10px] bg-card/95 backdrop-blur p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" />
              <span className="relative inline-flex size-2.5 rounded-full bg-accent" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">Live now</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Match #{m.matchNumber} · {m.stage}
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          <div className="text-right">
            <div className="text-base md:text-lg font-bold truncate">{home}</div>
          </div>
          <div className="flex items-center gap-3 text-3xl md:text-4xl font-extrabold tabular-nums">
            <span className="bg-gradient-to-b from-primary to-accent bg-clip-text text-transparent">
              {m.homeScore ?? 0}
            </span>
            <span className="text-muted-foreground text-base">:</span>
            <span className="bg-gradient-to-b from-accent to-primary bg-clip-text text-transparent">
              {m.awayScore ?? 0}
            </span>
          </div>
          <div>
            <div className="text-base md:text-lg font-bold truncate">{away}</div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 flex-wrap">
          <DateTimePill date={m.date} time={m.time} />
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate">
            <MapPin className="size-3" /> {m.stadium}, {m.city}
          </span>
        </div>
      </div>
    </button>
  );
}

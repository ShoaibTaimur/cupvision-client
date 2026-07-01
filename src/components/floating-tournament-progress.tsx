import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { Activity, BarChart3, ChevronRight, Trophy, X } from "lucide-react";
import { api, Match } from "@/lib/api";

type TournamentStats = {
  totalMatches: number;
  completed: number;
  upcoming: number;
  live: number;
  teamsCount: number;
  goals: number;
};

const STAGES_ORDER = [
  "Group Stage",
  "Round of 32",
  "Round of 16",
  "Quarter-finals",
  "Semi-finals",
  "Third Place",
  "Final",
] as const;

export function FloatingTournamentProgress() {
  const [open, setOpen] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement | null>(null);

  const statsQ = useQuery({
    queryKey: ["stats", "tournament", "floating-progress"],
    queryFn: () => api.get<TournamentStats>("/api/stats/tournament"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const matchesQ = useQuery({
    queryKey: ["matches", "all", "floating-progress"],
    queryFn: () => api.get<Match[]>("/api/matches"),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  const stats = statsQ.data;
  const matches = matchesQ.data || [];
  const completionRate =
    stats && stats.totalMatches > 0 ? Math.round((stats.completed / stats.totalMatches) * 100) : 0;

  const stageStats = useMemo(() => {
    return STAGES_ORDER.map((stage) => {
      const stageMatches = matches.filter((m) => m.stage.toLowerCase().includes(stage.toLowerCase()));
      const total = stageMatches.length;
      const completed = stageMatches.filter((m) => m.status === "completed").length;
      return { stage, total, completed };
    }).filter((item) => item.total > 0);
  }, [matches]);

  useLayoutEffect(() => {
    if (!open || !panelRef.current) return;
    const rect = panelRef.current.getBoundingClientRect();
    const nextX = Math.max(24, Math.min(origin.x - rect.left, rect.width - 24));
    const nextY = Math.max(24, Math.min(origin.y - rect.top, rect.height - 24));
    panelRef.current.style.transformOrigin = `${nextX}px ${nextY}px`;
  }, [open, origin]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          setOrigin({ x: event.clientX, y: event.clientY });
          setOpen(true);
        }}
        className="fixed bottom-20 right-4 z-50 inline-flex items-center gap-3 rounded-full border border-white/10 bg-zinc-950/86 px-4 py-3 text-left text-white shadow-[0_18px_44px_rgba(0,0,0,0.3)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:bg-zinc-950/92 sm:bottom-6 sm:right-24"
      >
        <div className="flex size-9 items-center justify-center rounded-full border border-primary/20 bg-primary/12 text-primary">
          <BarChart3 className="size-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/55">
            Progress
          </div>
          <div className="flex items-center gap-2 text-sm font-black tracking-tight">
            {statsQ.isLoading ? "--" : `${completionRate}%`}
            <span className="text-xs font-medium text-white/55">
              {stats ? `${stats.completed}/${stats.totalMatches}` : ""}
            </span>
          </div>
        </div>
        <ChevronRight className="size-4 text-white/45" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close tournament progress"
              className="fixed inset-0 z-[60] bg-black/42 backdrop-blur-[2px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, scale: 0.62, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.62, y: 18 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="fixed bottom-20 right-4 z-[61] w-[min(92vw,26rem)] overflow-hidden rounded-[1.9rem] border border-white/10 bg-zinc-950/96 text-white shadow-[0_34px_90px_rgba(0,0,0,0.46)] backdrop-blur-2xl sm:bottom-6 sm:right-24"
            >
              <div className="border-b border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.015))] px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-primary">
                      <Trophy className="size-3.5" />
                      Tournament Progress
                    </div>
                    <div className="mt-3 text-2xl font-black tracking-tight">
                      {statsQ.isLoading ? "Loading..." : `${completionRate}% complete`}
                    </div>
                    <p className="mt-1 text-sm text-white/60">
                      {stats
                        ? `${stats.completed} completed · ${stats.upcoming} upcoming · ${stats.live} live`
                        : "Live tournament progression overview"}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/6 text-white/75 transition hover:bg-white/10 hover:text-white"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-5 px-5 py-5">
                <div className="rounded-[1.4rem] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
                    <span>Overall</span>
                    <span>{stats ? `${stats.completed}/${stats.totalMatches}` : "--/--"}</span>
                  </div>
                  <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white/8">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,rgba(117,197,255,1),rgba(117,197,255,0.55))]"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {[
                      { label: "Teams", value: stats?.teamsCount ?? 0 },
                      { label: "Goals", value: stats?.goals ?? 0 },
                      { label: "Live", value: stats?.live ?? 0 },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-2xl border border-white/8 bg-black/18 px-3 py-3"
                      >
                        <div className="text-lg font-black tabular-nums">{item.value}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/45">
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">
                    <Activity className="size-3.5 text-primary" />
                    Stage progression
                  </div>
                  <div className="space-y-3">
                    {stageStats.map((item) => {
                      const percent = item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
                      return (
                        <div
                          key={item.stage}
                          className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                        >
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-white">{item.stage}</span>
                            <span className="text-xs font-medium text-white/55">
                              {item.completed}/{item.total} · {percent}%
                            </span>
                          </div>
                          <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/8">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(117,197,255,1),rgba(83,214,168,0.9))]"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    {!stageStats.length && (
                      <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-5 text-sm text-white/55">
                        Stage data loading.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

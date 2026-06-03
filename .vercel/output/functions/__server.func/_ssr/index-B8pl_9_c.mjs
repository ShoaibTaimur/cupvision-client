import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { L as LiveMatchCard, M as MatchCard } from "./match-card-DI31yNx1.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import { C as ChevronRight, A as Activity, b as CalendarClock, T as Trophy, c as Users } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
function useCountdown(target) {
  const [now, setNow] = reactExports.useState(() => Date.now());
  reactExports.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(id);
  }, []);
  if (!target) return null;
  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;
  const days = Math.floor(diff / 864e5);
  const hours = Math.floor(diff % 864e5 / 36e5);
  const minutes = Math.floor(diff % 36e5 / 6e4);
  const seconds = Math.floor(diff % 6e4 / 1e3);
  return {
    days,
    hours,
    minutes,
    seconds
  };
}
function Home() {
  const matches = useQuery({
    queryKey: ["matches"],
    queryFn: () => api.get("/api/matches")
  });
  const stats = useQuery({
    queryKey: ["stats", "tournament"],
    queryFn: () => api.get("/api/stats/tournament")
  });
  const list = matches.data || [];
  const live = list.find((m) => m.status === "live");
  const upcoming = list.filter((m) => m.status === "scheduled").sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))[0];
  const recent = list.filter((m) => m.status === "completed").sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)).slice(0, 6);
  const cd = useCountdown(upcoming ? `${upcoming.date}T${upcoming.time}:00` : void 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "relative overflow-hidden border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-block px-3 py-1 rounded-full text-xs bg-primary/15 text-primary border border-primary/30 mb-4", children: "FIFA World Cup 2026" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-4xl md:text-6xl font-bold tracking-tight max-w-3xl", children: [
          "Track. ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "Analyze." }),
          " Follow."
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-4 text-muted-foreground max-w-2xl", children: "Every match, every team, every result — the unofficial companion to the 2026 World Cup. Live status, group standings and a full chronological timeline." }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/matches", className: "inline-flex items-center gap-1.5 bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors", children: [
            "Browse matches ",
            /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "size-4" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/scoreboard", className: "inline-flex items-center gap-1.5 border border-border rounded-md px-4 py-2 text-sm font-medium hover:bg-secondary transition-colors", children: "View scoreboard" })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 py-10 grid lg:grid-cols-2 gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { className: "size-4 text-accent" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Live match" })
        ] }),
        matches.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28" }) : live ? /* @__PURE__ */ jsxRuntimeExports.jsx(LiveMatchCard, { m: live }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No matches live right now." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarClock, { className: "size-4 text-primary" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "Next match" })
        ] }),
        matches.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28" }) : upcoming ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
            upcoming.homeTeam?.name,
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-70", children: "vs" }),
            " ",
            upcoming.awayTeam?.name
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mb-3", children: [
            upcoming.date,
            " · ",
            upcoming.time,
            " · ",
            upcoming.stadium
          ] }),
          cd ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-4 gap-2 text-center", children: [["Days", cd.days], ["Hrs", cd.hours], ["Min", cd.minutes], ["Sec", cd.seconds]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-md py-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold tabular-nums", children: String(v).padStart(2, "0") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: l })
          ] }, l)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Starting any moment." })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No upcoming match scheduled." })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto max-w-7xl px-4 sm:px-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: [{
      label: "Total matches",
      value: stats.data?.totalMatches,
      icon: Trophy
    }, {
      label: "Completed",
      value: stats.data?.completed,
      icon: Trophy
    }, {
      label: "Upcoming",
      value: stats.data?.upcoming,
      icon: CalendarClock
    }, {
      label: "Teams",
      value: stats.data?.teamsCount,
      icon: Users
    }, {
      label: "Goals scored",
      value: stats.data?.goals,
      icon: Activity
    }].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-muted-foreground text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: s.label }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(s.icon, { className: "size-4" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold mt-1 tabular-nums", children: stats.isLoading ? "—" : s.value ?? 0 })
    ] }, s.label)) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mx-auto max-w-7xl px-4 sm:px-6 py-10", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-end justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-semibold", children: "Recent results" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/timeline", className: "text-sm text-primary hover:underline", children: "View timeline" })
      ] }),
      matches.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3", children: Array.from({
        length: 6
      }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28" }, i)) }) : recent.length ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3", children: recent.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(MatchCard, { m }, m._id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No completed matches yet." })
    ] })
  ] });
}
export {
  Home as component
};

import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { f as MapPin, g as Calendar, h as Clock } from "../_libs/lucide-react.mjs";
const STATUS_STYLES = {
  scheduled: "bg-secondary text-secondary-foreground",
  live: "bg-accent text-accent-foreground animate-pulse",
  awaiting_result: "bg-yellow-500/20 text-yellow-300",
  completed: "bg-primary/20 text-primary",
  cancelled: "bg-destructive/20 text-destructive-foreground",
  postponed: "bg-muted text-muted-foreground"
};
function StatusBadge({ status }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-medium ${STATUS_STYLES[status] || "bg-muted"}`, children: status.replace("_", " ") });
}
function DateTimePill({ date, time }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "inline-flex items-stretch rounded-md overflow-hidden border border-primary/30 text-[11px] font-semibold", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "size-3" }),
      " ",
      date
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 px-2 py-1 bg-accent/15 text-accent", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "size-3" }),
      " ",
      time
    ] })
  ] });
}
function MatchCard({ m, onClick }) {
  const home = m.homeTeam?.name || "TBD";
  const away = m.awayTeam?.name || "TBD";
  const completed = m.status === "completed";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      className: "text-left w-full bg-card border border-border rounded-lg p-4 hover:border-primary/40 hover:bg-card/80 transition-all",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between text-[11px] text-muted-foreground mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
            "Match #",
            m.matchNumber,
            " · ",
            m.stage,
            m.group ? ` · Group ${m.group}` : ""
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: m.status })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto_1fr] items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: home }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 text-lg font-bold tabular-nums", children: completed ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m.homeScore ?? 0 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-sm", children: "vs" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: m.awayScore ?? 0 })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-muted-foreground font-medium", children: "vs" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-semibold truncate", children: away }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center justify-between gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(DateTimePill, { date: m.date, time: m.time }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-3" }),
            " ",
            m.stadium,
            ", ",
            m.city
          ] })
        ] })
      ]
    }
  );
}
function LiveMatchCard({ m, onClick }) {
  const home = m.homeTeam?.name || "TBD";
  const away = m.awayTeam?.name || "TBD";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "button",
    {
      onClick,
      className: "relative text-left w-full rounded-xl p-[1.5px] bg-gradient-to-br from-accent via-primary to-accent overflow-hidden group",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -inset-1 bg-gradient-to-r from-accent/40 via-primary/40 to-accent/40 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative rounded-[10px] bg-card/95 backdrop-blur p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "relative flex size-2.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute inline-flex h-full w-full rounded-full bg-accent opacity-75 animate-ping" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "relative inline-flex size-2.5 rounded-full bg-accent" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[11px] font-bold uppercase tracking-widest text-accent", children: "Live now" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[11px] text-muted-foreground", children: [
              "Match #",
              m.matchNumber,
              " · ",
              m.stage
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-[1fr_auto_1fr] items-center gap-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-right", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base md:text-lg font-bold truncate", children: home }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-3xl md:text-4xl font-extrabold tabular-nums", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-b from-primary to-accent bg-clip-text text-transparent", children: m.homeScore ?? 0 }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground text-base", children: ":" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "bg-gradient-to-b from-accent to-primary bg-clip-text text-transparent", children: m.awayScore ?? 0 })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-base md:text-lg font-bold truncate", children: away }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(DateTimePill, { date: m.date, time: m.time }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] text-muted-foreground truncate", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(MapPin, { className: "size-3" }),
              " ",
              m.stadium,
              ", ",
              m.city
            ] })
          ] })
        ] })
      ]
    }
  );
}
export {
  LiveMatchCard as L,
  MatchCard as M,
  StatusBadge as S
};

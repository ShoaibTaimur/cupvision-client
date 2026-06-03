import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import { M as MatchCard } from "./match-card-DI31yNx1.mjs";
import { S as Search, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
function ScoreboardPage() {
  const [q, setQ] = reactExports.useState("");
  const [openTeam, setOpenTeam] = reactExports.useState(null);
  const standings = useQuery({
    queryKey: ["scoreboard"],
    queryFn: () => api.get("/api/stats/scoreboard")
  });
  const filtered = reactExports.useMemo(() => {
    const list = standings.data || [];
    if (!q) return list;
    const n = q.toLowerCase();
    return list.filter((s) => s.team.name.toLowerCase().includes(n));
  }, [standings.data, q]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", children: "Scoreboard" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-6", children: "Win = 3 pts · Draw = 1 pt · Loss = 0 pts. Ranked by points, then wins, then name." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative max-w-md mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search team", className: "w-full bg-card border border-border rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })
    ] }),
    standings.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto bg-card border border-border rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase tracking-wide text-muted-foreground border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left", children: "#" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left", children: "Team" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right", children: "P" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right", children: "W" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right", children: "D" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right", children: "L" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right hidden sm:table-cell", children: "GF" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right hidden sm:table-cell", children: "GA" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right hidden sm:table-cell", children: "GD" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right", children: "Pts" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
        filtered.map((s, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { onClick: () => setOpenTeam(s.teamId), className: "border-b border-border last:border-0 hover:bg-secondary cursor-pointer transition-colors", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-muted-foreground", children: idx + 1 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-3 font-medium", children: [
            s.team.name,
            s.team.group && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "ml-2 text-[10px] text-muted-foreground", children: [
              "Group ",
              s.team.group
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right tabular-nums", children: s.played }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right tabular-nums", children: s.wins }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right tabular-nums", children: s.draws }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right tabular-nums", children: s.losses }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right tabular-nums hidden sm:table-cell", children: s.goalsFor }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right tabular-nums hidden sm:table-cell", children: s.goalsAgainst }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right tabular-nums hidden sm:table-cell", children: s.goalDiff > 0 ? `+${s.goalDiff}` : s.goalDiff }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-3 text-right font-bold text-primary tabular-nums", children: s.points })
        ] }, s.teamId)),
        filtered.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 10, className: "px-3 py-8 text-center text-muted-foreground", children: "No teams found." }) })
      ] })
    ] }) }),
    openTeam && /* @__PURE__ */ jsxRuntimeExports.jsx(TeamModal, { teamId: openTeam, onClose: () => setOpenTeam(null) })
  ] });
}
function TeamModal({
  teamId,
  onClose
}) {
  const [tab, setTab] = reactExports.useState("overview");
  const team = useQuery({
    queryKey: ["team", teamId],
    queryFn: () => api.get(`/api/teams/${teamId}`)
  });
  const detail = useQuery({
    queryKey: ["team-stats", teamId],
    queryFn: () => api.get(`/api/stats/team/${teamId}`)
  });
  const d = detail.data;
  const tabs = ["overview", "wins", "draws", "losses", "upcoming"];
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in-95", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-5 border-b border-border flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold", children: team.data?.name || "Team" }),
        team.data?.group && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
          "Group ",
          team.data.group
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "p-1.5 rounded-md hover:bg-secondary transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-5 pt-3 border-b border-border flex gap-1 overflow-x-auto", children: tabs.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTab(t), className: `px-3 py-2 text-sm capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`, children: t }, t)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 overflow-y-auto flex-1", children: detail.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32" }) : !d ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No data." }) : tab === "overview" ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3", children: [["Played", d.standing?.played ?? 0], ["Wins", d.standing?.wins ?? 0], ["Draws", d.standing?.draws ?? 0], ["Losses", d.standing?.losses ?? 0], ["Goals for", d.standing?.goalsFor ?? 0], ["Goals against", d.standing?.goalsAgainst ?? 0], ["Goal diff", d.standing?.goalDiff ?? 0], ["Points", d.standing?.points ?? 0]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-secondary rounded-md p-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-wide text-muted-foreground", children: l }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xl font-bold tabular-nums", children: v })
    ] }, l)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx(MatchList, { list: d[tab] }) })
  ] }) });
}
function MatchList({
  list
}) {
  if (!list?.length) return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No matches." });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: list.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(MatchCard, { m }, m._id)) });
}
export {
  ScoreboardPage as component
};

import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { M as MatchCard } from "./match-card-DI31yNx1.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import { S as Search } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
const STATUSES = ["all", "scheduled", "live", "awaiting_result", "completed", "cancelled", "postponed"];
const GROUPS = ["all", ...["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"]];
function MatchesPage() {
  const [q, setQ] = reactExports.useState("");
  const [status, setStatus] = reactExports.useState("all");
  const [group, setGroup] = reactExports.useState("all");
  const matches = useQuery({
    queryKey: ["matches", "all"],
    queryFn: () => api.get("/api/matches")
  });
  const filtered = reactExports.useMemo(() => {
    const list = matches.data || [];
    return list.filter((m) => {
      if (status !== "all" && m.status !== status) return false;
      if (group !== "all" && m.group !== group) return false;
      if (q) {
        const n = q.toLowerCase();
        const hay = [m.homeTeam?.name, m.awayTeam?.name, m.stadium, m.city, String(m.matchNumber), m.stage].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(n)) return false;
      }
      return true;
    });
  }, [matches.data, q, status, group]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", children: "Matches" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-6", children: "Browse fixtures and results." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row gap-3 mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: q, onChange: (e) => setQ(e.target.value), placeholder: "Search by team, stadium, city, match #", className: "w-full bg-card border border-border rounded-md pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: status, onChange: (e) => setStatus(e.target.value), className: "bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s.replace("_", " ") }, s)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: group, onChange: (e) => setGroup(e.target.value), className: "bg-card border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary", children: GROUPS.map((g) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: g, children: g === "all" ? "All groups" : `Group ${g}` }, g)) })
    ] }),
    matches.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3", children: Array.from({
      length: 9
    }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-28" }, i)) }) : matches.isError ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive", children: "Failed to load matches. Check VITE_API_URL." }) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No matches match your filters." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 lg:grid-cols-3 gap-3", children: filtered.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(MatchCard, { m }, m._id)) })
  ] });
}
export {
  MatchesPage as component
};

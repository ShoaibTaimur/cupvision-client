import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { M as MatchCard } from "./match-card-DI31yNx1.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/lucide-react.mjs";
function TimelinePage() {
  const matches = useQuery({
    queryKey: ["matches"],
    queryFn: () => api.get("/api/matches")
  });
  const grouped = reactExports.useMemo(() => {
    const list = (matches.data || []).slice().sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    const map = /* @__PURE__ */ new Map();
    for (const m of list) {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date).push(m);
    }
    return Array.from(map.entries());
  }, [matches.data]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", children: "Timeline" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-8", children: "Every match, day by day." }),
    matches.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-96" }) : grouped.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No matches yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative pl-6 border-l border-border space-y-8", children: grouped.map(([date, items]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-semibold mb-3", children: date }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid md:grid-cols-2 gap-3", children: items.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsx(MatchCard, { m }, m._id)) })
    ] }, date)) })
  ] });
}
export {
  TimelinePage as component
};

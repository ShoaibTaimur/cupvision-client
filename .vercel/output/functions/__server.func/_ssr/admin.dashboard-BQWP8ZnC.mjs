import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { A as AdminShell } from "./admin-shell-QraR5oT6.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import "../_libs/react-dom.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/lucide-react.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
function Dashboard() {
  const stats = useQuery({
    queryKey: ["admin", "tournament"],
    queryFn: () => api.get("/api/stats/tournament")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-1", children: "Dashboard" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Tournament overview." }),
    stats.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 md:grid-cols-5 gap-3", children: [["Total matches", stats.data?.totalMatches], ["Completed", stats.data?.completed], ["Upcoming", stats.data?.upcoming], ["Live", stats.data?.live], ["Teams", stats.data?.teamsCount]].map(([l, v]) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs text-muted-foreground", children: l }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-2xl font-bold tabular-nums mt-1", children: v ?? 0 })
    ] }, l)) })
  ] });
}
export {
  Dashboard as component
};

import { j as jsxRuntimeExports } from "../_libs/react.mjs";
function AboutPage() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-3xl px-4 sm:px-6 py-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", children: "About CupVision" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-8", children: "Track. Analyze. Follow." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold mb-2", children: "Purpose" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "CupVision is a fan-built companion for the 2026 FIFA World Cup. It provides live match status, group standings, and a full timeline — all from data curated by our admins (no FIFA APIs)." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold mb-2", children: "Features" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-muted-foreground list-disc list-inside space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Match tracking with rich status (scheduled, live, completed, …)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Dynamic group standings (no stored stats)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Team statistics and per-team breakdown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Search across teams, stadiums, cities and match numbers" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Chronological timeline view" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Admin dashboard with CSV import" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold mb-2", children: "Stack" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("ul", { className: "text-sm text-muted-foreground list-disc list-inside space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Frontend: Vite, React, TypeScript, TanStack Router, Tailwind CSS" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Backend: Node.js, Express, TypeScript" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("li", { children: "Database: MongoDB Atlas (native driver)" })
        ] })
      ] })
    ] })
  ] });
}
export {
  AboutPage as component
};

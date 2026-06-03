import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, b as useRouterState, O as Outlet, H as HeadContent, S as Scripts, d as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { r as reactDomExports } from "../_libs/react-dom.mjs";
import { T as Toaster } from "../_libs/sonner.mjs";
import { T as Trophy, M as Menu, X } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
const appCss = "/assets/styles-CY6FyC-o.css";
function reportLovableError(error, context = {}) {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...context
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error"
    }
  );
}
const NAV = [
  { to: "/", label: "Home" },
  { to: "/matches", label: "Matches" },
  { to: "/scoreboard", label: "Scoreboard" },
  { to: "/timeline", label: "Timeline" },
  { to: "/authors", label: "Authors" },
  { to: "/about", label: "About" }
];
const activeCls = "px-3 py-1.5 rounded-md text-sm font-medium text-primary-foreground bg-primary";
const idleCls = "px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors";
function SiteHeader() {
  const [open, setOpen] = reactExports.useState(false);
  const [closing, setClosing] = reactExports.useState(false);
  const closeMenu = () => {
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 280);
  };
  reactExports.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold tracking-tight", children: "CupVision" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground -mt-0.5", children: "Track. Analyze. Follow." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "hidden md:flex items-center gap-1", children: NAV.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: n.to,
          className: idleCls,
          activeProps: { className: activeCls },
          activeOptions: { exact: n.to === "/" },
          children: n.label
        },
        n.to
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Link,
          {
            to: "/admin/login",
            className: "hidden md:inline text-xs text-muted-foreground hover:text-foreground transition-colors",
            children: "Admin"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setOpen(true),
            className: "md:hidden inline-flex items-center justify-center size-10 rounded-md border border-border bg-card hover:bg-secondary transition-colors",
            "aria-label": "Open menu",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "size-5" })
          }
        )
      ] })
    ] }),
    open && typeof document !== "undefined" && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "md:hidden fixed inset-0 z-[100] overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `absolute inset-0 bg-background/60 backdrop-blur-md ${closing ? "animate-out fade-out duration-300" : "animate-in fade-in duration-200"}`,
            onClick: closeMenu
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "aside",
          {
            className: `absolute right-0 top-0 h-full w-72 max-w-[85%] bg-card border-l border-border shadow-2xl flex flex-col ${closing ? "animate-out slide-out-to-right duration-300" : "animate-in slide-in-from-right duration-300"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 h-16 border-b border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-5" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold tracking-tight", children: "CupVision" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    onClick: closeMenu,
                    className: "inline-flex items-center justify-center size-9 rounded-md hover:bg-secondary",
                    "aria-label": "Close menu",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "size-5" })
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-3 space-y-1", children: NAV.map((n) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                Link,
                {
                  to: n.to,
                  onClick: closeMenu,
                  className: "flex items-center justify-between px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                  activeProps: {
                    className: "flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold text-primary-foreground bg-primary"
                  },
                  activeOptions: { exact: n.to === "/" },
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: n.label }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs opacity-70", children: "→" })
                  ]
                },
                n.to
              )) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-4 border-t border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Link,
                {
                  to: "/admin/login",
                  onClick: closeMenu,
                  className: "block text-center text-xs text-muted-foreground hover:text-foreground py-2",
                  children: "Admin login"
                }
              ) })
            ]
          }
        )
      ] }),
      document.body
    )
  ] });
}
function SiteFooter() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("footer", { className: "border-t border-border mt-16", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 py-8 text-xs text-muted-foreground flex flex-wrap items-center justify-between gap-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      "© ",
      (/* @__PURE__ */ new Date()).getFullYear(),
      " CupVision — FIFA World Cup 2026 tracker"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { children: "Built with React, TypeScript, Express, MongoDB" })
  ] }) });
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Go home"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  reactExports.useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "a",
        {
          href: "/",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Go home"
        }
      )
    ] })
  ] }) });
}
const Route$c = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CupVision — Track. Analyze. Follow." },
      { name: "description", content: "Live FIFA World Cup 2026 tracker: matches, scoreboard, statistics and timeline." },
      { name: "author", content: "CupVision" },
      { property: "og:title", content: "CupVision — FIFA World Cup 2026 Tracker" },
      { property: "og:description", content: "Match tracking, team rankings and statistics for the 2026 World Cup." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$c.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const isAdmin = path.startsWith("/admin");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col", children: [
      !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(SiteHeader, {}),
      /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}) }),
      !isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsx(SiteFooter, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { theme: "dark", position: "top-right", richColors: true })
  ] });
}
const $$splitComponentImporter$b = () => import("./timeline-D5K7FrpB.mjs");
const Route$b = createFileRoute("/timeline")({
  head: () => ({
    meta: [{
      title: "Timeline — CupVision"
    }, {
      name: "description",
      content: "Chronological timeline of every match in the 2026 World Cup."
    }, {
      property: "og:title",
      content: "Timeline — CupVision"
    }, {
      property: "og:description",
      content: "Every World Cup 2026 match in chronological order."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./scoreboard-C9k3OuQn.mjs");
const Route$a = createFileRoute("/scoreboard")({
  head: () => ({
    meta: [{
      title: "Scoreboard — CupVision"
    }, {
      name: "description",
      content: "Live group standings ranked by points and wins."
    }, {
      property: "og:title",
      content: "Scoreboard — CupVision"
    }, {
      property: "og:description",
      content: "Live group standings for the 2026 FIFA World Cup."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./matches-BNzn0QaA.mjs");
const Route$9 = createFileRoute("/matches")({
  head: () => ({
    meta: [{
      title: "Matches — CupVision"
    }, {
      name: "description",
      content: "Browse and search all 2026 FIFA World Cup matches by status, group and team."
    }, {
      property: "og:title",
      content: "Matches — CupVision"
    }, {
      property: "og:description",
      content: "Browse and search all 2026 FIFA World Cup matches."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./authors-DfDt-Jmd.mjs");
const Route$8 = createFileRoute("/authors")({
  head: () => ({
    meta: [{
      title: "Authors — CupVision"
    }, {
      name: "description",
      content: "The people behind CupVision."
    }, {
      property: "og:title",
      content: "Authors — CupVision"
    }, {
      property: "og:description",
      content: "The people behind CupVision."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./about-BCQE6dDx.mjs");
const Route$7 = createFileRoute("/about")({
  head: () => ({
    meta: [{
      title: "About — CupVision"
    }, {
      name: "description",
      content: "About CupVision: purpose, features and tech stack."
    }, {
      property: "og:title",
      content: "About — CupVision"
    }, {
      property: "og:description",
      content: "About CupVision: purpose, features and tech stack."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./index-B8pl_9_c.mjs");
const Route$6 = createFileRoute("/")({
  head: () => ({
    meta: [{
      title: "CupVision — FIFA World Cup 2026 Tracker"
    }, {
      name: "description",
      content: "Live matches, scoreboard and team statistics for the 2026 World Cup."
    }, {
      property: "og:title",
      content: "CupVision — FIFA World Cup 2026 Tracker"
    }, {
      property: "og:description",
      content: "Live matches, scoreboard and team statistics for the 2026 World Cup."
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./admin.teams-xIt0UYV6.mjs");
const Route$5 = createFileRoute("/admin/teams")({
  head: () => ({
    meta: [{
      title: "Teams — CupVision Admin"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children })
  ] });
}
const $$splitComponentImporter$4 = () => import("./admin.matches-C7IpisBt.mjs");
const Route$4 = createFileRoute("/admin/matches")({
  head: () => ({
    meta: [{
      title: "Matches — CupVision Admin"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./admin.login-CsNfaXJI.mjs");
const Route$3 = createFileRoute("/admin/login")({
  head: () => ({
    meta: [{
      title: "Admin login — CupVision"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin.import-BI_T7zTS.mjs");
const Route$2 = createFileRoute("/admin/import")({
  head: () => ({
    meta: [{
      title: "CSV Import — CupVision Admin"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin.dashboard-BQWP8ZnC.mjs");
const Route$1 = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [{
      title: "Dashboard — CupVision Admin"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./admin.authors-B_c1yD7U.mjs");
const Route = createFileRoute("/admin/authors")({
  head: () => ({
    meta: [{
      title: "Authors — CupVision Admin"
    }]
  }),
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TimelineRoute = Route$b.update({
  id: "/timeline",
  path: "/timeline",
  getParentRoute: () => Route$c
});
const ScoreboardRoute = Route$a.update({
  id: "/scoreboard",
  path: "/scoreboard",
  getParentRoute: () => Route$c
});
const MatchesRoute = Route$9.update({
  id: "/matches",
  path: "/matches",
  getParentRoute: () => Route$c
});
const AuthorsRoute = Route$8.update({
  id: "/authors",
  path: "/authors",
  getParentRoute: () => Route$c
});
const AboutRoute = Route$7.update({
  id: "/about",
  path: "/about",
  getParentRoute: () => Route$c
});
const IndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$c
});
const AdminTeamsRoute = Route$5.update({
  id: "/admin/teams",
  path: "/admin/teams",
  getParentRoute: () => Route$c
});
const AdminMatchesRoute = Route$4.update({
  id: "/admin/matches",
  path: "/admin/matches",
  getParentRoute: () => Route$c
});
const AdminLoginRoute = Route$3.update({
  id: "/admin/login",
  path: "/admin/login",
  getParentRoute: () => Route$c
});
const AdminImportRoute = Route$2.update({
  id: "/admin/import",
  path: "/admin/import",
  getParentRoute: () => Route$c
});
const AdminDashboardRoute = Route$1.update({
  id: "/admin/dashboard",
  path: "/admin/dashboard",
  getParentRoute: () => Route$c
});
const AdminAuthorsRoute = Route.update({
  id: "/admin/authors",
  path: "/admin/authors",
  getParentRoute: () => Route$c
});
const rootRouteChildren = {
  IndexRoute,
  AboutRoute,
  AuthorsRoute,
  MatchesRoute,
  ScoreboardRoute,
  TimelineRoute,
  AdminAuthorsRoute,
  AdminDashboardRoute,
  AdminImportRoute,
  AdminLoginRoute,
  AdminMatchesRoute,
  AdminTeamsRoute
};
const routeTree = Route$c._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  Field as F,
  router as r
};

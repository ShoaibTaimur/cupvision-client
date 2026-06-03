import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { e as useNavigate, b as useRouterState, L as Link } from "../_libs/tanstack__react-router.mjs";
import { r as reactDomExports } from "../_libs/react-dom.mjs";
import { g as getToken, c as clearToken } from "./api-B4OEU-Fb.mjs";
import { T as Trophy, k as LayoutDashboard, g as Calendar, c as Users, l as UserCog, m as Upload, H as House, n as LogOut, M as Menu, X } from "../_libs/lucide-react.mjs";
const NAV = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/matches", label: "Matches", icon: Calendar },
  { to: "/admin/teams", label: "Teams", icon: Users },
  { to: "/admin/authors", label: "Authors", icon: UserCog },
  { to: "/admin/import", label: "Import CSV", icon: Upload }
];
function AdminShell({ children }) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = reactExports.useState(false);
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
    if (!getToken()) {
      navigate({ to: "/admin/login" });
    } else {
      setReady(true);
    }
  }, [navigate]);
  reactExports.useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);
  if (!ready) return null;
  const logOut = () => {
    clearToken();
    navigate({ to: "/admin/login" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen flex flex-col md:flex-row", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "w-60 shrink-0 border-r border-border bg-card hidden md:flex flex-col", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/", className: "flex items-center gap-2 px-5 py-4 border-b border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-5" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold tracking-tight", children: "CupVision" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground", children: "Admin" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-2 space-y-1", children: NAV.map((n) => {
        const active = path === n.to;
        return /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: n.to,
            className: `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(n.icon, { className: "size-4" }),
              " ",
              n.label
            ]
          },
          n.to
        );
      }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-2 space-y-1 border-t border-border", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Link,
          {
            to: "/",
            className: "flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "size-4" }),
              " Back to site"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: logOut,
            className: "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" }),
              " Log out"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("header", { className: "md:hidden sticky top-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border w-full", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-14 px-4 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/dashboard", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-4" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-tight", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-bold tracking-tight", children: "CupVision" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground -mt-0.5", children: "Admin" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setOpen(true),
          className: "inline-flex items-center justify-center size-10 rounded-md border border-border bg-card hover:bg-secondary transition-colors",
          "aria-label": "Open menu",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "size-5" })
        }
      )
    ] }) }),
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
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "leading-tight", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-bold tracking-tight", children: "CupVision" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-muted-foreground -mt-0.5", children: "Admin" })
                  ] })
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
              /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { className: "flex-1 p-3 space-y-1 overflow-y-auto", children: NAV.map((n) => {
                const active = path === n.to;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: n.to,
                    onClick: closeMenu,
                    className: `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${active ? "bg-primary text-primary-foreground font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(n.icon, { className: "size-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1", children: n.label })
                    ]
                  },
                  n.to
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 space-y-1 border-t border-border", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  Link,
                  {
                    to: "/",
                    onClick: closeMenu,
                    className: "flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(House, { className: "size-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Back to site" })
                    ]
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => {
                      closeMenu();
                      setTimeout(logOut, 290);
                    },
                    className: "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(LogOut, { className: "size-4" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Log out" })
                    ]
                  }
                )
              ] })
            ]
          }
        )
      ] }),
      document.body
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("main", { className: "flex-1 p-6 overflow-x-hidden", children })
  ] });
}
export {
  AdminShell as A
};

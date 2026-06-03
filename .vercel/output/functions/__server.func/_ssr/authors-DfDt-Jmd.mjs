import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import { U as User, G as Github, L as Linkedin, a as Globe } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__query-core.mjs";
function AuthorsPage() {
  const authors = useQuery({
    queryKey: ["authors"],
    queryFn: () => api.get("/api/authors")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto max-w-7xl px-4 sm:px-6 py-10", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-bold mb-2", children: "Authors" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-muted-foreground mb-8", children: "The team behind CupVision." }),
    authors.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: Array.from({
      length: 3
    }).map((_, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64" }, i)) }) : authors.data?.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "No authors added yet." }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-4", children: authors.data?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5 hover:border-primary/40 transition-colors", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "size-20 rounded-full bg-secondary overflow-hidden mb-4 flex items-center justify-center", children: a.image ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: a.image, alt: a.name, className: "size-full object-cover", loading: "lazy" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(User, { className: "size-8 text-muted-foreground" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold", children: a.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-primary mb-2", children: a.role }),
      a.bio && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-3", children: a.bio }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
        a.github && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: a.github, target: "_blank", rel: "noreferrer", className: "p-1.5 rounded-md hover:bg-secondary transition-colors", "aria-label": "GitHub", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Github, { className: "size-4" }) }),
        a.linkedin && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: a.linkedin, target: "_blank", rel: "noreferrer", className: "p-1.5 rounded-md hover:bg-secondary transition-colors", "aria-label": "LinkedIn", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Linkedin, { className: "size-4" }) }),
        a.portfolio && /* @__PURE__ */ jsxRuntimeExports.jsx("a", { href: a.portfolio, target: "_blank", rel: "noreferrer", className: "p-1.5 rounded-md hover:bg-secondary transition-colors", "aria-label": "Portfolio", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "size-4" }) })
      ] })
    ] }, a._id)) })
  ] });
}
export {
  AuthorsPage as component
};

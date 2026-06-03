import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { A as AdminShell } from "./admin-shell-QraR5oT6.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./router-Dz4BtAie.mjs";
import "../_libs/react-dom.mjs";
import { e as Plus, P as Pencil, d as Trash2 } from "../_libs/lucide-react.mjs";
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
import "util";
import "crypto";
import "async_hooks";
import "stream";
const empty = {
  name: "",
  role: "",
  image: "",
  bio: "",
  github: "",
  linkedin: "",
  portfolio: ""
};
function AuthorsAdmin() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["authors"],
    queryFn: () => api.get("/api/authors")
  });
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(empty);
  const save = useMutation({
    mutationFn: async () => editing ? api.put(`/api/authors/${editing._id}`, form) : api.post("/api/authors", form, true),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["authors"]
      });
      setEditing(null);
      setForm(empty);
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: (id) => api.del(`/api/authors/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["authors"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  function startEdit(a) {
    setEditing(a);
    setForm({
      name: a.name,
      role: a.role,
      image: a.image || "",
      bio: a.bio || "",
      github: a.github || "",
      linkedin: a.linkedin || "",
      portfolio: a.portfolio || ""
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Authors" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "People behind the site." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        setEditing(null);
        setForm(empty);
      }, className: "bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " New author"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_400px] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: list.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase text-muted-foreground border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-left", children: "Role" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-3 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          list.data?.map((a) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: a.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground", children: a.role }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right space-x-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => startEdit(a), className: "p-1.5 rounded-md hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => confirm(`Delete ${a.name}?`) && del.mutate(a._id), className: "p-1.5 rounded-md hover:bg-destructive/20 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
            ] })
          ] }, a._id)),
          list.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "px-3 py-8 text-center text-muted-foreground", children: "No authors." }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        save.mutate();
      }, className: "bg-card border border-border rounded-lg p-5 space-y-3 h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: editing ? "Edit author" : "New author" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.name, onChange: (e) => setForm({
          ...form,
          name: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Role *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.role, onChange: (e) => setForm({
          ...form,
          role: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Image URL", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.image, onChange: (e) => setForm({
          ...form,
          image: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Bio", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.bio, onChange: (e) => setForm({
          ...form,
          bio: e.target.value
        }), rows: 3, className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "GitHub URL", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.github, onChange: (e) => setForm({
          ...form,
          github: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "LinkedIn URL", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.linkedin, onChange: (e) => setForm({
          ...form,
          linkedin: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Portfolio URL", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.portfolio, onChange: (e) => setForm({
          ...form,
          portfolio: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: save.isPending, className: "w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50", children: save.isPending ? "Saving..." : editing ? "Update" : "Create" })
      ] })
    ] })
  ] });
}
export {
  AuthorsAdmin as component
};

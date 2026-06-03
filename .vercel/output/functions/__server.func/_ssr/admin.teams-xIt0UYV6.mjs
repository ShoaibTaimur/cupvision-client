import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { A as AdminShell } from "./admin-shell-QraR5oT6.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { P as Pencil, d as Trash2, e as Plus } from "../_libs/lucide-react.mjs";
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
  group: "",
  flag: ""
};
function TeamsAdmin() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["teams"],
    queryFn: () => api.get("/api/teams")
  });
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(empty);
  const save = useMutation({
    mutationFn: async () => {
      if (editing) return api.put(`/api/teams/${editing._id}`, form);
      return api.post("/api/teams", form, true);
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["teams"]
      });
      setEditing(null);
      setForm(empty);
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: (id) => api.del(`/api/teams/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["teams"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  function startEdit(t) {
    setEditing(t);
    setForm({
      name: t.name,
      group: t.group || "",
      flag: t.flag || ""
    });
  }
  function startNew() {
    setEditing(null);
    setForm(empty);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Teams" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Manage all competing teams." })
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: list.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase text-muted-foreground border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-3", children: "Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-3", children: "Group" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-3", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          list.data?.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: t.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 text-muted-foreground", children: t.group || "—" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right space-x-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => startEdit(t), className: "p-1.5 rounded-md hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => confirm(`Delete ${t.name}?`) && del.mutate(t._id), className: "p-1.5 rounded-md hover:bg-destructive/20 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
            ] })
          ] }, t._id)),
          list.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 3, className: "px-3 py-8 text-center text-muted-foreground", children: "No teams." }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        save.mutate();
      }, className: "bg-card border border-border rounded-lg p-5 space-y-3 h-fit", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: editing ? "Edit team" : "New team" }),
          editing && /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { type: "button", onClick: startNew, className: "text-xs text-muted-foreground hover:text-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-3 inline" }),
            " New"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Name *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.name, onChange: (e) => setForm({
          ...form,
          name: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Group (A-L)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.group, onChange: (e) => setForm({
          ...form,
          group: e.target.value.toUpperCase()
        }), maxLength: 1, className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Flag URL", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.flag, onChange: (e) => setForm({
          ...form,
          flag: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: save.isPending, className: "w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50", children: save.isPending ? "Saving..." : editing ? "Update" : "Create" })
      ] })
    ] })
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1", children })
  ] });
}
export {
  Field,
  TeamsAdmin as component
};

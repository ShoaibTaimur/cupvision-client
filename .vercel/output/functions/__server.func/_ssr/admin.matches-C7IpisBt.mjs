import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { a as useQueryClient, u as useQuery, b as useMutation } from "../_libs/tanstack__react-query.mjs";
import { A as AdminShell } from "./admin-shell-QraR5oT6.mjs";
import { a as api } from "./api-B4OEU-Fb.mjs";
import { S as Skeleton } from "./skeleton-De23qhti.mjs";
import { S as StatusBadge } from "./match-card-DI31yNx1.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { F as Field } from "./router-Dz4BtAie.mjs";
import "../_libs/react-dom.mjs";
import { e as Plus, T as Trophy, P as Pencil, d as Trash2 } from "../_libs/lucide-react.mjs";
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
const STATUSES = ["scheduled", "live", "awaiting_result", "completed", "cancelled", "postponed"];
const empty = {
  matchNumber: 1,
  homeTeamId: "",
  awayTeamId: "",
  date: "",
  time: "",
  stadium: "",
  city: "",
  stage: "Group Stage",
  group: "",
  status: "scheduled",
  notes: ""
};
function MatchesAdmin() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin-matches"],
    queryFn: () => api.get("/api/matches")
  });
  const teams = useQuery({
    queryKey: ["teams"],
    queryFn: () => api.get("/api/teams")
  });
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(empty);
  const [resultFor, setResultFor] = reactExports.useState(null);
  const [actionsFor, setActionsFor] = reactExports.useState(null);
  const [formModalOpen, setFormModalOpen] = reactExports.useState(false);
  const save = useMutation({
    mutationFn: async () => {
      if (editing) return api.put(`/api/matches/${editing._id}`, form);
      return api.post("/api/matches", form, true);
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({
        queryKey: ["admin-matches"]
      });
      setEditing(null);
      setForm(empty);
      setFormModalOpen(false);
    },
    onError: (e) => toast.error(e.message)
  });
  const del = useMutation({
    mutationFn: (id) => api.del(`/api/matches/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({
        queryKey: ["admin-matches"]
      });
    },
    onError: (e) => toast.error(e.message)
  });
  function startEdit(m) {
    setEditing(m);
    setForm({
      matchNumber: m.matchNumber,
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId,
      date: m.date,
      time: m.time,
      stadium: m.stadium,
      city: m.city,
      stage: m.stage,
      group: m.group || "",
      status: m.status,
      notes: m.notes || ""
    });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold", children: "Matches" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground", children: "Create, edit and submit results." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => {
        setEditing(null);
        setForm(empty);
        setFormModalOpen(true);
      }, className: "bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm font-medium flex items-center gap-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "size-4" }),
        " New match"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_400px] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg overflow-hidden", children: list.isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-64" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-xs uppercase text-muted-foreground border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-3", children: "#" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-3", children: "Match" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-3 hidden sm:table-cell", children: "When" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left px-3 py-3 hidden sm:table-cell", children: "Status" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-right px-3 py-3 hidden md:table-cell", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
          list.data?.map((m) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-b border-border last:border-0 md:cursor-default cursor-pointer hover:bg-secondary/50 md:hover:bg-transparent", onClick: (e) => {
            if (window.matchMedia("(min-width: 768px)").matches) return;
            e.stopPropagation();
            setActionsFor(m);
          }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 tabular-nums", children: m.matchNumber }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-medium", children: [
                m.homeTeam?.name,
                " vs ",
                m.awayTeam?.name
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
                m.stage,
                m.group ? ` · Group ${m.group}` : ""
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1 sm:hidden flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
                  m.date,
                  " ",
                  m.time
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: m.status })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-muted-foreground text-xs hidden sm:table-cell", children: [
              m.date,
              " ",
              m.time
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 hidden sm:table-cell", children: /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: m.status }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right space-x-1 whitespace-nowrap hidden md:table-cell", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setResultFor(m), className: "p-1.5 rounded-md hover:bg-secondary", title: "Submit result", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => startEdit(m), className: "p-1.5 rounded-md hover:bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => confirm("Delete match?") && del.mutate(m._id), className: "p-1.5 rounded-md hover:bg-destructive/20 text-destructive", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }) })
            ] })
          ] }, m._id)),
          list.data?.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 5, className: "px-3 py-8 text-center text-muted-foreground", children: "No matches." }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
        e.preventDefault();
        save.mutate();
      }, className: "bg-card border border-border rounded-lg p-5 space-y-3 h-fit hidden lg:block", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: editing ? `Edit match #${editing.matchNumber}` : "New match" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Match # *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, required: true, value: form.matchNumber, onChange: (e) => setForm({
            ...form,
            matchNumber: Number(e.target.value)
          }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.status, onChange: (e) => setForm({
            ...form,
            status: e.target.value
          }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm", children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s.replace("_", " ") }, s)) }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Home team *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: form.homeTeamId, onChange: (e) => setForm({
          ...form,
          homeTeamId: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— select —" }),
          teams.data?.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t._id, children: t.name }, t._id))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Away team *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: form.awayTeamId, onChange: (e) => setForm({
          ...form,
          awayTeamId: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— select —" }),
          teams.data?.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t._id, children: t.name }, t._id))
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "date", value: form.date, onChange: (e) => setForm({
            ...form,
            date: e.target.value
          }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Time *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "time", value: form.time, onChange: (e) => setForm({
            ...form,
            time: e.target.value
          }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Stadium *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.stadium, onChange: (e) => setForm({
          ...form,
          stadium: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "City *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.city, onChange: (e) => setForm({
            ...form,
            city: e.target.value
          }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Group (A-L)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.group, maxLength: 1, onChange: (e) => setForm({
            ...form,
            group: e.target.value.toUpperCase()
          }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Stage *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.stage, onChange: (e) => setForm({
          ...form,
          stage: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.notes, onChange: (e) => setForm({
          ...form,
          notes: e.target.value
        }), rows: 2, className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: save.isPending, className: "w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50", children: save.isPending ? "Saving..." : editing ? "Update" : "Create" })
      ] })
    ] }),
    resultFor && /* @__PURE__ */ jsxRuntimeExports.jsx(ResultModal, { match: resultFor, onClose: () => setResultFor(null), onSaved: () => {
      setResultFor(null);
      qc.invalidateQueries({
        queryKey: ["admin-matches"]
      });
    } }),
    actionsFor && /* @__PURE__ */ jsxRuntimeExports.jsx(ActionsModal, { match: actionsFor, onClose: () => setActionsFor(null), onEdit: () => {
      startEdit(actionsFor);
      setActionsFor(null);
      setFormModalOpen(true);
    }, onResult: () => {
      setResultFor(actionsFor);
      setActionsFor(null);
    }, onDelete: () => {
      if (confirm("Delete match?")) {
        del.mutate(actionsFor._id);
        setActionsFor(null);
      }
    } }),
    formModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(FormModal, { title: editing ? `Edit match #${editing.matchNumber}` : "New match", onClose: () => {
      setFormModalOpen(false);
      setEditing(null);
      setForm(empty);
    }, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      save.mutate();
    }, className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Match # *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 1, required: true, value: form.matchNumber, onChange: (e) => setForm({
          ...form,
          matchNumber: Number(e.target.value)
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Status *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: form.status, onChange: (e) => setForm({
          ...form,
          status: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm", children: STATUSES.map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s.replace("_", " ") }, s)) }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Home team *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: form.homeTeamId, onChange: (e) => setForm({
        ...form,
        homeTeamId: e.target.value
      }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— select —" }),
        teams.data?.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t._id, children: t.name }, t._id))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Away team *", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { required: true, value: form.awayTeamId, onChange: (e) => setForm({
        ...form,
        awayTeamId: e.target.value
      }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "— select —" }),
        teams.data?.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t._id, children: t.name }, t._id))
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Date *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "date", value: form.date, onChange: (e) => setForm({
          ...form,
          date: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Time *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, type: "time", value: form.time, onChange: (e) => setForm({
          ...form,
          time: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Stadium *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.stadium, onChange: (e) => setForm({
        ...form,
        stadium: e.target.value
      }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "City *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.city, onChange: (e) => setForm({
          ...form,
          city: e.target.value
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Group (A-L)", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: form.group, maxLength: 1, onChange: (e) => setForm({
          ...form,
          group: e.target.value.toUpperCase()
        }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Stage *", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { required: true, value: form.stage, onChange: (e) => setForm({
        ...form,
        stage: e.target.value
      }), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Notes", children: /* @__PURE__ */ jsxRuntimeExports.jsx("textarea", { value: form.notes, onChange: (e) => setForm({
        ...form,
        notes: e.target.value
      }), rows: 2, className: "w-full bg-background border border-border rounded-md px-3 py-2 text-sm" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: save.isPending, className: "w-full bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50", children: save.isPending ? "Saving..." : editing ? "Update" : "Create" })
    ] }) })
  ] });
}
function FormModal({
  title,
  onClose,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[90] bg-background/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 ease-out", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-5 py-4 border-b border-border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: title }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "size-8 inline-flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors", "aria-label": "Close", children: "✕" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-5 overflow-y-auto", children })
  ] }) });
}
function ActionsModal({
  match,
  onClose,
  onEdit,
  onResult,
  onDelete
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[90] bg-background/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-5 animate-in slide-in-from-bottom sm:zoom-in-95 duration-200", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground", children: [
        "Match #",
        match.matchNumber,
        " · ",
        match.stage,
        match.group ? ` · Group ${match.group}` : ""
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "font-semibold mt-0.5", children: [
        match.homeTeam?.name,
        " vs ",
        match.awayTeam?.name
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mt-1 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          match.date,
          " ",
          match.time
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(StatusBadge, { status: match.status })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onResult, className: "w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-medium transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trophy, { className: "size-4" }),
        " Submit result"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onEdit, className: "w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-secondary hover:bg-secondary/70 text-sm font-medium transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "size-4" }),
        " Edit match"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: onDelete, className: "w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-destructive/15 hover:bg-destructive/25 text-destructive text-sm font-medium transition-colors", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "size-4" }),
        " Delete match"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "w-full mt-3 px-4 py-2.5 rounded-lg border border-border text-sm hover:bg-secondary transition-colors", children: "Cancel" })
  ] }) });
}
function ResultModal({
  match,
  onClose,
  onSaved
}) {
  const [home, setHome] = reactExports.useState(match.homeScore ?? 0);
  const [away, setAway] = reactExports.useState(match.awayScore ?? 0);
  const submit = useMutation({
    mutationFn: () => api.post(`/api/matches/${match._id}/result`, {
      homeScore: home,
      awayScore: away
    }, true),
    onSuccess: () => {
      toast.success("Result saved");
      onSaved();
    },
    onError: (e) => toast.error(e.message)
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4", onClick: onClose, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg w-full max-w-md p-5", onClick: (e) => e.stopPropagation(), children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-semibold mb-1", children: [
      "Submit result · Match #",
      match.matchNumber
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mb-4", children: [
      match.homeTeam?.name,
      " vs ",
      match.awayTeam?.name
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: match.homeTeam?.name || "Home", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, value: home, onChange: (e) => setHome(Number(e.target.value)), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-lg text-center font-bold" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: match.awayTeam?.name || "Away", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", min: 0, value: away, onChange: (e) => setAway(Number(e.target.value)), className: "w-full bg-background border border-border rounded-md px-3 py-2 text-lg text-center font-bold" }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-2 mt-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onClose, className: "px-3 py-1.5 text-sm rounded-md border border-border hover:bg-secondary", children: "Cancel" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => submit.mutate(), disabled: submit.isPending, className: "px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50", children: submit.isPending ? "Saving..." : "Save result" })
    ] })
  ] }) });
}
export {
  MatchesAdmin as component
};

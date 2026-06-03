import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { A as AdminShell } from "./admin-shell-QraR5oT6.mjs";
import { A as API_URL, g as getToken } from "./api-B4OEU-Fb.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import "../_libs/react-dom.mjs";
import { D as Download, F as FileUp, i as CircleCheck, j as CircleAlert } from "../_libs/lucide-react.mjs";
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
function ImportPage() {
  const [file, setFile] = reactExports.useState(null);
  const [validating, setValidating] = reactExports.useState(false);
  const [committing, setCommitting] = reactExports.useState(false);
  const [result, setResult] = reactExports.useState(null);
  async function callAPI(path, f) {
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      body: fd,
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok,
      data
    };
  }
  async function onValidate() {
    if (!file) return;
    setValidating(true);
    setResult(null);
    try {
      const {
        ok,
        data
      } = await callAPI("/api/import/validate", file);
      if (!ok) throw new Error(data?.error || `Server error. Check that your backend exposes POST /api/import/validate.`);
      const safe = {
        valid: !!data?.valid,
        errors: Array.isArray(data?.errors) ? data.errors : [],
        preview: Array.isArray(data?.preview) ? data.preview : [],
        totalRows: Number(data?.totalRows ?? 0),
        newTeams: Array.isArray(data?.newTeams) ? data.newTeams : []
      };
      setResult(safe);
      if (safe.valid) toast.success(`Validated ${safe.totalRows} rows`);
      else toast.error(`${safe.errors.length} errors found`);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setValidating(false);
    }
  }
  async function onCommit() {
    if (!file) return;
    setCommitting(true);
    try {
      const {
        ok,
        data
      } = await callAPI("/api/import/commit", file);
      if (!ok) throw new Error(data.error || "Commit failed");
      toast.success(`Imported ${data.inserted} matches, created ${data.teamsCreated} teams`);
      setFile(null);
      setResult(null);
    } catch (e) {
      toast.error(e.message);
    } finally {
      setCommitting(false);
    }
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(AdminShell, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-2xl font-bold mb-1", children: "CSV Import" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mb-6", children: "Bulk-upload matches. Teams are auto-created from unique names." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid lg:grid-cols-[1fr_360px] gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-card border border-border rounded-lg p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: "1. Get the template" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Open in Excel/Sheets, fill in your matches, save as CSV." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("a", { href: "/matches-template.csv", download: true, className: "inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "size-4" }),
            " Download template"
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold mb-3", children: "2. Upload your CSV" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover:border-primary/40 transition-colors", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileUp, { className: "size-8 mx-auto text-muted-foreground mb-2" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm", children: file ? file.name : "Click to choose a CSV file" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: ".csv,text/csv", onChange: (e) => {
              setFile(e.target.files?.[0] || null);
              setResult(null);
            }, className: "hidden" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mt-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !file || validating, onClick: onValidate, className: "flex-1 bg-secondary hover:bg-secondary/80 rounded-md py-2 text-sm font-medium disabled:opacity-50", children: validating ? "Validating..." : "3. Validate" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: !file || !result?.valid || committing, onClick: onCommit, className: "flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50", children: committing ? "Importing..." : "4. Confirm import" })
          ] })
        ] }),
        result && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-lg p-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-3", children: [
            result.valid ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { className: "size-5 text-primary" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CircleAlert, { className: "size-5 text-destructive" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-semibold", children: result.valid ? `${result.totalRows} rows valid` : `${result.errors.length} errors` })
          ] }),
          result.errors.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "text-sm text-destructive-foreground bg-destructive/10 rounded-md p-3 max-h-48 overflow-y-auto space-y-1", children: result.errors.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("li", { children: [
            "• ",
            e
          ] }, i)) }),
          result.newTeams.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: result.newTeams.length }),
            " unique team names referenced. Any not in DB will be auto-created."
          ] }),
          result.preview.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 overflow-x-auto", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs text-muted-foreground mb-2", children: [
              "Preview (first ",
              result.preview.length,
              ")"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-xs", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-muted-foreground border-b border-border", children: /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: Object.keys(result.preview[0]).map((k) => /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-2 py-1 text-left", children: k }, k)) }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { children: result.preview.map((r, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { className: "border-b border-border last:border-0", children: Object.values(r).map((v, j) => /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-2 py-1 whitespace-nowrap", children: String(v) }, j)) }, i)) })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "bg-card border border-border rounded-lg p-5 h-fit text-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-semibold text-sm mb-3", children: "CSV format" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1", children: "Column" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "text-left py-1", children: "Notes" })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { className: "text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "matchNumber" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "positive int, unique" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "homeTeam" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "auto-created if new" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "awayTeam" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "auto-created if new" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "date" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "YYYY-MM-DD" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "HH:MM (24h)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "stadium" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "text" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "city" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "text" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "stage" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "e.g. Group Stage" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "group" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "A–L or empty" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "font-mono", children: "status" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("td", { children: "scheduled, live, awaiting_result, completed, cancelled, postponed" })
            ] })
          ] })
        ] })
      ] })
    ] })
  ] });
}
export {
  ImportPage as component
};

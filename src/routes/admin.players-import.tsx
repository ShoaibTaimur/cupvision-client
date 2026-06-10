import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { API_URL, getToken } from "@/lib/api";
import { toast } from "sonner";
import { Download, FileUp, CheckCircle2, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/admin/players-import")({
  head: () => ({ meta: [{ title: "Players CSV Import — CupVision Admin" }] }),
  component: PlayersImportPage,
});

interface ValidateResponse {
  valid: boolean;
  errors: string[];
  preview: any[];
  totalRows: number;
  newTeams: string[];
}

function PlayersImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [validating, setValidating] = useState(false);
  const [committing, setCommitting] = useState(false);
  const [result, setResult] = useState<ValidateResponse | null>(null);

  async function callAPI(path: string, f: File) {
    const fd = new FormData();
    fd.append("file", f);
    const res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      body: fd,
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  }

  async function onValidate() {
    if (!file) return;
    setValidating(true);
    setResult(null);
    try {
      const { ok, data } = await callAPI("/api/import/players/validate", file);
      if (!ok) throw new Error(data?.error || "Validation failed");
      const safe: ValidateResponse = {
        valid: !!data?.valid,
        errors: Array.isArray(data?.errors) ? data.errors : [],
        preview: Array.isArray(data?.preview) ? data.preview : [],
        totalRows: Number(data?.totalRows ?? 0),
        newTeams: Array.isArray(data?.newTeams) ? data.newTeams : [],
      };
      setResult(safe);
      if (safe.valid) toast.success(`Validated ${safe.totalRows} players`);
      else toast.error(`${safe.errors.length} errors found`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setValidating(false);
    }
  }

  async function onCommit() {
    if (!file) return;
    setCommitting(true);
    try {
      const { ok, data } = await callAPI("/api/import/players/commit", file);
      if (!ok) throw new Error(data.error || "Commit failed");
      toast.success(`Imported ${data.inserted} players, created ${data.teamsCreated} teams`);
      setFile(null);
      setResult(null);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCommitting(false);
    }
  }

  return (
    <AdminShell>
      <h1 className="text-2xl font-bold mb-1">Players CSV Import</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Bulk-upload squad rosters. Teams are auto-created from unique team names.
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
              <div>
                <h2 className="font-semibold">1. Get the template</h2>
                <p className="text-xs text-muted-foreground">
                  Open in Excel/Sheets, fill in your players, save as CSV.
                </p>
              </div>
              <a
                href="/players-template.csv"
                download
                className="inline-flex items-center gap-1.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-md text-sm"
              >
                <Download className="size-4" /> Download template
              </a>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-5">
            <h2 className="font-semibold mb-3">2. Upload your CSV</h2>
            <label className="block border-2 border-dashed border-border rounded-md p-8 text-center cursor-pointer hover:border-primary/40 transition-colors">
              <FileUp className="size-8 mx-auto text-muted-foreground mb-2" />
              <div className="text-sm">{file ? file.name : "Click to choose a CSV file"}</div>
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setResult(null);
                }}
                className="hidden"
              />
            </label>
            <div className="flex gap-2 mt-3">
              <button
                disabled={!file || validating}
                onClick={onValidate}
                className="flex-1 bg-secondary hover:bg-secondary/80 rounded-md py-2 text-sm font-medium disabled:opacity-50"
              >
                {validating ? "Validating..." : "3. Validate"}
              </button>
              <button
                disabled={!file || !result?.valid || committing}
                onClick={onCommit}
                className="flex-1 bg-primary text-primary-foreground rounded-md py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {committing ? "Importing..." : "4. Confirm import"}
              </button>
            </div>
          </div>

          {result && (
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                {result.valid ? (
                  <CheckCircle2 className="size-5 text-primary" />
                ) : (
                  <AlertCircle className="size-5 text-destructive" />
                )}
                <h2 className="font-semibold">
                  {result.valid
                    ? `${result.totalRows} players valid`
                    : `${result.errors.length} errors`}
                </h2>
              </div>
              {result.errors.length > 0 && (
                <ul className="text-sm text-destructive-foreground bg-destructive/10 rounded-md p-3 max-h-48 overflow-y-auto space-y-1">
                  {result.errors.map((e, i) => (
                    <li key={i}>• {e}</li>
                  ))}
                </ul>
              )}
              {result.newTeams.length > 0 && (
                <div className="mt-3 text-xs text-muted-foreground">
                  <strong>{result.newTeams.length}</strong> unique team names referenced. Any not in
                  DB will be auto-created.
                </div>
              )}
              {result.preview.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <div className="text-xs text-muted-foreground mb-2">
                    Preview (first {result.preview.length})
                  </div>
                  <table className="w-full text-xs">
                    <thead className="text-muted-foreground border-b border-border">
                      <tr>
                        {Object.keys(result.preview[0]).map((k) => (
                          <th key={k} className="px-2 py-1 text-left">
                            {k}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.preview.map((r, i) => (
                        <tr key={i} className="border-b border-border last:border-0">
                          {Object.values(r).map((v, j) => (
                            <td key={j} className="px-2 py-1 whitespace-nowrap">
                              {v == null || v === "" ? "—" : String(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="bg-card border border-border rounded-lg p-5 h-fit text-xs">
          <h3 className="font-semibold text-sm mb-3">CSV format</h3>
          <table className="w-full">
            <thead className="text-muted-foreground">
              <tr>
                <th className="text-left py-1">Column</th>
                <th className="text-left py-1">Notes</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr>
                <td className="font-mono">teamName</td>
                <td>required, auto-created</td>
              </tr>
              <tr>
                <td className="font-mono">name</td>
                <td>required, player full name</td>
              </tr>
              <tr>
                <td className="font-mono">position</td>
                <td>required: GK, DEF, MID, FWD</td>
              </tr>
              <tr>
                <td className="font-mono">jerseyNumber</td>
                <td>optional 1–99, unique per team</td>
              </tr>
              <tr>
                <td className="font-mono">dateOfBirth</td>
                <td>optional YYYY-MM-DD</td>
              </tr>
              <tr>
                <td className="font-mono">height</td>
                <td>optional cm, 140–230</td>
              </tr>
              <tr>
                <td className="font-mono">club</td>
                <td>optional</td>
              </tr>
              <tr>
                <td className="font-mono">nationality</td>
                <td>optional</td>
              </tr>
            </tbody>
          </table>
        </aside>
      </div>
    </AdminShell>
  );
}

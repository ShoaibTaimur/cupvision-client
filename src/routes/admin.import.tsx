import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminShell } from "@/components/admin-shell";
import { API_URL, getToken } from "@/lib/api";
import { toast } from "sonner";
import { Download, FileUp, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/admin/import")({
  head: () => ({ meta: [{ title: "CSV Import — CupVision Admin" }] }),
  component: ImportPage,
});

interface ValidateResponse {
  valid: boolean;
  errors: string[];
  preview: any[];
  totalRows: number;
  newTeams: string[];
}

function ImportPage() {
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
      const { ok, data } = await callAPI("/api/import/validate", file);
      if (!ok)
        throw new Error(
          data?.error || `Server error. Check that your backend exposes POST /api/import/validate.`,
        );
      const safe: ValidateResponse = {
        valid: !!data?.valid,
        errors: Array.isArray(data?.errors) ? data.errors : [],
        preview: Array.isArray(data?.preview) ? data.preview : [],
        totalRows: Number(data?.totalRows ?? 0),
        newTeams: Array.isArray(data?.newTeams) ? data.newTeams : [],
      };
      setResult(safe);
      if (safe.valid) toast.success(`Validated ${safe.totalRows} rows`);
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
      const { ok, data } = await callAPI("/api/import/commit", file);
      if (!ok) throw new Error(data.error || "Commit failed");
      toast.success(`Imported ${data.inserted} matches, created ${data.teamsCreated} teams`);
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
      <h1 className="text-2xl font-bold mb-1">CSV Import</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Bulk-upload matches for any stage (Group, R32, R16, QF, SF, 3rd Place, Final). Teams are auto-created from unique names — use placeholders like "Winner Group A" for unresolved knockout slots.
      </p>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-semibold">1. Get the template</h2>
                <p className="text-xs text-muted-foreground">
                  Open in Excel/Sheets, fill in your matches, save as CSV.
                </p>
              </div>
              <a
                href="/matches-template.csv"
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
              <Button
                variant="secondary"
                disabled={!file || validating}
                onClick={onValidate}
                className="flex-1"
              >
                {validating ? "Validating..." : "3. Validate"}
              </Button>
              <Button
                disabled={!file || !result?.valid || committing}
                onClick={onCommit}
                className="flex-1"
              >
                {committing ? "Importing..." : "4. Confirm import"}
              </Button>
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
                    ? `${result.totalRows} rows valid`
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
                  <Table className="text-xs">
                    <TableHeader>
                      <TableRow>
                        {Object.keys(result.preview[0]).map((k) => (
                          <TableHead key={k}>
                            {k}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.preview.map((r, i) => (
                        <TableRow key={i}>
                          {Object.values(r).map((v, j) => (
                            <TableCell key={j} className="whitespace-nowrap">
                              {String(v)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="bg-card border border-border rounded-lg p-5 h-fit text-xs">
          <h3 className="font-semibold text-sm mb-3">CSV format</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Column</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono">matchNumber</TableCell>
                <TableCell>positive int, unique</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">homeTeam</TableCell>
                <TableCell>auto-created if new</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">awayTeam</TableCell>
                <TableCell>auto-created if new</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">date</TableCell>
                <TableCell>YYYY-MM-DD</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">time</TableCell>
                <TableCell>HH:MM (24h)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">stadium</TableCell>
                <TableCell>text</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">city</TableCell>
                <TableCell>text</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">stage</TableCell>
                <TableCell>Group Stage | Round of 32 | Round of 16 | Quarter Final | Semi Final | Third Place | Final</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">group</TableCell>
                <TableCell>A–L (required for Group Stage, leave empty for knockouts)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono">status</TableCell>
                <TableCell>scheduled, live, awaiting_result, completed, cancelled, postponed</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </aside>
      </div>
    </AdminShell>
  );
}

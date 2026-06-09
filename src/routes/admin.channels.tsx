import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BadgePlus, Pencil, Radio, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Skeleton } from "@/components/skeleton";
import { api, type AdminChannel } from "@/lib/api";
import { Field } from "./admin.teams";

export const Route = createFileRoute("/admin/channels")({
  head: () => ({ meta: [{ title: "Channels — CupVision Admin" }] }),
  component: ChannelsAdmin,
});

const empty = {
  name: "",
  category: "",
  badge: "",
  description: "",
  poster: "",
  accent: "",
  streamType: "auto" as "hls" | "file" | "auto",
  sourceUrl: "",
  isFeatured: false,
  isPublished: true,
  sortOrder: 0,
  useRedirect: false,
  redirectUrl: "",
  redirectLabel: "",
};

function ChannelsAdmin() {
  const qc = useQueryClient();
  const list = useQuery({
    queryKey: ["admin-channels"],
    queryFn: () => api.authed<AdminChannel[]>("/api/channels/admin"),
  });
  const [editing, setEditing] = useState<AdminChannel | null>(null);
  const [form, setForm] = useState(empty);

  const save = useMutation({
    mutationFn: async () => {
      if (editing) return api.put(`/api/channels/${editing._id}`, form);
      return api.post("/api/channels", form, true);
    },
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-channels"] });
      qc.invalidateQueries({ queryKey: ["channels"] });
      setEditing(null);
      setForm(empty);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => api.del(`/api/channels/${id}`),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-channels"] });
      qc.invalidateQueries({ queryKey: ["channels"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  function startEdit(channel: AdminChannel) {
    setEditing(channel);
    setForm({
      name: channel.name,
      category: channel.category || "",
      badge: channel.badge || "",
      description: channel.description || "",
      poster: channel.poster || "",
      accent: channel.accent || "",
      streamType: channel.streamType,
      sourceUrl: channel.sourceUrl,
      isFeatured: !!channel.isFeatured,
      isPublished: channel.isPublished !== false,
      sortOrder: channel.sortOrder || 0,
      useRedirect: !!channel.useRedirect,
      redirectUrl: channel.redirectUrl || "",
      redirectLabel: channel.redirectLabel || "",
    });
  }

  function startNew() {
    setEditing(null);
    setForm(empty);
  }

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Channels</h1>
          <p className="text-sm text-muted-foreground">
            Add live streams. Publish featured watch tabs from one panel.
          </p>
        </div>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
        >
          <BadgePlus className="size-4" /> New channel
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {list.isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-3 text-left">Channel</th>
                  <th className="px-3 py-3 text-left hidden md:table-cell">Type</th>
                  <th className="px-3 py-3 text-left">State</th>
                  <th className="px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.data?.map((channel) => (
                  <tr key={channel._id} className="border-b border-border last:border-0">
                    <td className="px-3 py-3">
                      <div className="font-medium">{channel.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {channel.category || "Live channel"}
                      </div>
                    </td>
                    <td className="hidden px-3 py-3 text-muted-foreground md:table-cell">
                      {channel.streamType}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${channel.isPublished !== false ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-500/15 text-zinc-400"}`}
                        >
                          {channel.isPublished !== false ? "Published" : "Draft"}
                        </span>
                        {channel.isFeatured ? (
                          <span className="rounded-full bg-cyan-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-cyan-400">
                            Featured
                          </span>
                        ) : null}
                        <span className="rounded-full bg-amber-500/15 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-amber-400">
                          Direct CDN
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => startEdit(channel)}
                          className="rounded-md p-1.5 hover:bg-secondary"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => confirm(`Delete ${channel.name}?`) && del.mutate(channel._id)}
                          className="rounded-md p-1.5 text-destructive hover:bg-destructive/15"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {list.data?.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-muted-foreground">
                      No channels yet.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
          className="space-y-3 rounded-lg border border-border bg-card p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">{editing ? "Edit channel" : "New channel"}</h2>
            {editing ? (
              <button
                type="button"
                onClick={startNew}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Reset
              </button>
            ) : null}
          </div>

          <Field label="Channel name *">
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Badge">
              <input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Source link *">
            <input
              required
              type="url"
              value={form.sourceUrl}
              onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://example.com/live.m3u8"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Stream type">
              <select
                value={form.streamType}
                onChange={(e) =>
                  setForm({ ...form, streamType: e.target.value as typeof form.streamType })
                }
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                <option value="auto">Auto detect</option>
                <option value="hls">HLS / m3u8</option>
                <option value="file">Direct file</option>
              </select>
            </Field>
            <Field label="Sort order">
              <input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
          </div>

          <Field label="Poster image">
            <input
              type="url"
              value={form.poster}
              onChange={(e) => setForm({ ...form, poster: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>

          <Field label="Accent background">
            <input
              value={form.accent}
              onChange={(e) => setForm({ ...form, accent: e.target.value })}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="linear-gradient(...) or #0891b2"
            />
          </Field>

          <p className="rounded-md border border-border bg-background px-3 py-3 text-xs leading-5 text-muted-foreground">
            Streams play directly from the upstream CDN in the browser via HLS.js. No segments
            pass through CupVision servers — zero proxy bandwidth. The source URL is visible to
            anyone who inspects the page network tab.
          </p>

          <div className="space-y-3 rounded-md border border-border bg-background px-3 py-3">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={form.useRedirect}
                onChange={(e) => setForm({ ...form, useRedirect: e.target.checked })}
              />
              <span>Use external redirect (no embedded player)</span>
            </label>
            <p className="text-xs leading-5 text-muted-foreground">
              When on, the watch page hides the player and shows a button that opens the link
              below in a new tab. Use it to push viewers to an external site so no stream
              requests hit your server.
            </p>
            {form.useRedirect ? (
              <>
                <Field label="Redirect URL *">
                  <input
                    type="url"
                    required={form.useRedirect}
                    value={form.redirectUrl}
                    onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="https://example.com/live"
                  />
                </Field>
                <Field label="Button label">
                  <input
                    value={form.redirectLabel}
                    onChange={(e) => setForm({ ...form, redirectLabel: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Watch on external site"
                  />
                </Field>
              </>
            ) : null}
          </div>


          <label className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            <span className="flex items-center gap-2">
              <Radio className="size-4 text-cyan-500" /> Highlight on watch page
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
            />
            <span>Visible on public site</span>
          </label>

          <button
            disabled={save.isPending}
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {save.isPending ? "Saving..." : editing ? "Update channel" : "Create channel"}
          </button>
        </form>
      </div>
    </AdminShell>
  );
}

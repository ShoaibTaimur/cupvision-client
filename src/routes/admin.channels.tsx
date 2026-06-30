import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { BadgePlus, Pencil, Radio, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminShell } from "@/components/admin-shell";
import { Skeleton } from "@/components/skeleton";
import { api, type AdminChannel } from "@/lib/api";
import { Field } from "./admin.teams";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
      setIsModalOpen(false);
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
    setIsModalOpen(true);
  }

  function startNew() {
    setEditing(null);
    setForm(empty);
    setIsModalOpen(true);
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
        <Button onClick={startNew} className="flex items-center gap-2">
          <BadgePlus className="size-4" /> New channel
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {list.isLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Channel</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead>State</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data?.map((channel) => (
                <TableRow key={channel._id}>
                  <TableCell>
                    <div className="font-medium">{channel.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {channel.category || "Live channel"}
                    </div>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {channel.streamType}
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(channel)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          confirm(`Delete ${channel.name}?`) && del.mutate(channel._id)
                        }
                        className="text-destructive hover:bg-destructive/15 hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {list.data?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No channels yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </div>

      {isModalOpen && (
        <FormModal
          title={editing ? "Edit Channel" : "New Channel"}
          onClose={() => {
            setIsModalOpen(false);
            setEditing(null);
            setForm(empty);
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
            className="space-y-4"
          >
            <Field label="Channel name *">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <Input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </Field>
              <Field label="Badge">
                <Input
                  value={form.badge}
                  onChange={(e) => setForm({ ...form, badge: e.target.value })}
                />
              </Field>
            </div>

            <Field label="Description">
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>

            <Field label="Source link *">
              <Input
                required
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                placeholder="https://example.com/live.m3u8"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Stream type">
                <Select
                  value={form.streamType}
                  onValueChange={(value) => setForm({ ...form, streamType: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto detect</SelectItem>
                    <SelectItem value="hls">HLS / m3u8</SelectItem>
                    <SelectItem value="file">Direct file</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Sort order">
                <Input
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </Field>
            </div>

            <Field label="Poster image">
              <Input
                type="url"
                value={form.poster}
                onChange={(e) => setForm({ ...form, poster: e.target.value })}
              />
            </Field>

            <Field label="Accent background">
              <Input
                value={form.accent}
                onChange={(e) => setForm({ ...form, accent: e.target.value })}
                placeholder="linear-gradient(...) or #0891b2"
              />
            </Field>

            <p className="rounded-md border border-border bg-background px-3 py-3 text-xs leading-5 text-muted-foreground">
              Streams play directly from the upstream CDN in the browser via HLS.js. No segments pass
              through CupVision servers — zero proxy bandwidth. The source URL is visible to anyone
              who inspects the page network tab.
            </p>

            <div className="space-y-3 rounded-md border border-border bg-background px-3 py-3">
              <label className="flex items-center gap-3 text-sm">
                <Checkbox
                  checked={form.useRedirect}
                  onCheckedChange={(c) => setForm({ ...form, useRedirect: !!c })}
                />
                <span>Use external redirect (no embedded player)</span>
              </label>
              <p className="text-xs leading-5 text-muted-foreground">
                When on, the watch page hides the player and shows a button that opens the link below
                in a new tab. Use it to push viewers to an external site so no stream requests hit
                your server.
              </p>
              {form.useRedirect ? (
                <>
                  <Field label="Redirect URL *">
                    <Input
                      type="url"
                      required={form.useRedirect}
                      value={form.redirectUrl}
                      onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })}
                      placeholder="https://example.com/live"
                    />
                  </Field>
                  <Field label="Button label">
                    <Input
                      value={form.redirectLabel}
                      onChange={(e) => setForm({ ...form, redirectLabel: e.target.value })}
                      placeholder="Watch on external site"
                    />
                  </Field>
                </>
              ) : null}
            </div>

            <label className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-3 text-sm">
              <Checkbox
                checked={form.isFeatured}
                onCheckedChange={(c) => setForm({ ...form, isFeatured: !!c })}
              />
              <span className="flex items-center gap-2">
                <Radio className="size-4 text-cyan-500" /> Highlight on watch page
              </span>
            </label>

            <label className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-3 text-sm">
              <Checkbox
                checked={form.isPublished}
                onCheckedChange={(c) => setForm({ ...form, isPublished: !!c })}
              />
              <span>Visible on public site</span>
            </label>

            <Button
              disabled={save.isPending}
              className="w-full"
            >
              {save.isPending ? "Saving..." : editing ? "Update channel" : "Create channel"}
            </Button>
          </form>
        </FormModal>
      )}
    </AdminShell>
  );
}

function FormModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[90] bg-background/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-card border border-border w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="size-8 inline-flex items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

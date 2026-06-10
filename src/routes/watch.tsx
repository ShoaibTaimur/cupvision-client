import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ExternalLink, PlayCircle, Radio, Tv } from "lucide-react";
import { ChannelPlayer } from "@/components/channel-player";
import { SectionReveal } from "@/components/section-reveal";
import { Skeleton, ChannelCardSkeleton, PlayerSkeleton } from "@/components/skeleton";
import { api, type Channel } from "@/lib/api";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "Watch Live — CupVision" },
      { name: "description", content: "Watch live channels curated by CupVision admins." },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const channels = useQuery({
    queryKey: ["channels"],
    queryFn: () => api.get<Channel[]>("/api/channels"),
  });
  const [selectedId, setSelectedId] = useState<string>("");

  const list = channels.data || [];
  const featured = list.find((item) => item.isFeatured) || list[0];

  useEffect(() => {
    if (!selectedId && featured?._id) setSelectedId(featured._id);
    if (selectedId && !list.some((item) => item._id === selectedId) && featured?._id) {
      setSelectedId(featured._id);
    }
  }, [featured, list, selectedId]);

  const current = list.find((item) => item._id === selectedId) || featured;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <SectionReveal
        delay={0.06}
        className="relative overflow-hidden rounded-[1.75rem] border border-border bg-card p-6 sm:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 pointer-events-none" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary">
              <Radio className="size-3.5" /> Live Channels
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
              Watch curated streams without leaving CupVision.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Admin adds channels. Fans open one tab. Featured stream stays front and center on all
              screens.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-auto">
            <StatCard label="Channels live" value={String(list.length)} icon={Tv} />
            <StatCard label="Featured now" value={featured?.name ? "1" : "0"} icon={PlayCircle} />
          </div>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.14} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="space-y-4">
          {channels.isLoading ? (
            <PlayerSkeleton />
          ) : current ? (
            <>
              {current.useRedirect && current.redirectUrl ? (
                <RedirectCard channel={current} />
              ) : (
                <ChannelPlayer channel={current} />
              )}
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {current.badge || current.category || "Live"}
                  </span>
                  {current.isFeatured ? (
                    <span className="text-xs uppercase tracking-[0.3em] text-primary">
                      Featured
                    </span>
                  ) : null}
                </div>
                <h2 className="mt-4 text-2xl font-semibold">{current.name}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {current.description || "Live channel available now."}
                </p>
              </div>
            </>
          ) : (
            <EmptyState />
          )}
        </div>

        <aside className="rounded-lg border border-border bg-card p-4 sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Channel lineup</h2>
            <p className="text-sm text-muted-foreground">
              Tap channel. Player updates fast on mobile, tablet, desktop.
            </p>
          </div>
          {channels.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <ChannelCardSkeleton key={index} />
              ))}
            </div>
          ) : list.length ? (
            <div className="space-y-3">
              {list.map((item) => {
                const active = item._id === current?._id;
                return (
                  <button
                    key={item._id}
                    onClick={() => setSelectedId(item._id)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${active ? "border-primary bg-primary/10" : "border-border bg-background hover:bg-secondary"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold">{item.name}</div>
                        <div className="mt-1 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                          {item.category || "Live channel"}
                        </div>
                      </div>
                      {item.isFeatured ? (
                        <span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-primary">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
                      {item.description || "Watch stream inside CupVision."}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <EmptyState compact />
          )}
        </aside>
      </SectionReveal>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Tv }) {
  return (
    <div className="min-w-32 rounded-lg border border-border bg-background/80 p-4">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
        <Icon className="size-4" />
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
    </div>
  );
}

function EmptyState({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
      {compact ? "No channels published yet." : "No channels published yet. Add one from admin."}
    </div>
  );
}

function RedirectCard({ channel }: { channel: Channel }) {
  const label = channel.redirectLabel?.trim() || `Watch ${channel.name} on external site`;
  return (
    <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-primary/15 via-background to-accent/15">
      <div
        className="flex aspect-video w-full flex-col items-center justify-center gap-5 bg-black/40 p-8 text-center"
        style={
          channel.poster
            ? {
                backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.85)), url(${channel.poster})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary">
          <Radio className="size-3.5" /> External stream
        </div>
        <h3 className="text-2xl font-semibold text-white sm:text-3xl">{channel.name}</h3>
        <p className="max-w-md text-sm leading-6 text-white/80">
          This channel is hosted on an external site. Click below to open the live stream in a new
          tab.
        </p>
        <a
          href={channel.redirectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:scale-[1.02]"
        >
          <ExternalLink className="size-4" />
          {label}
        </a>
      </div>
    </div>
  );
}

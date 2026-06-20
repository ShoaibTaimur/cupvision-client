import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { api, Match } from "@/lib/api";
import { MatchCard } from "@/components/match-card";
import { SectionReveal } from "@/components/section-reveal";
import { Skeleton, MatchCardSkeleton } from "@/components/skeleton";
import { formatDate } from "@/lib/date";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/timeline")({
  head: () => ({
    meta: [
      { title: "Timeline — CupVision" },
      {
        name: "description",
        content: "Chronological timeline of every match in the 2026 World Cup.",
      },
      { property: "og:title", content: "Timeline — CupVision" },
      { property: "og:description", content: "Every World Cup 2026 match in chronological order." },
    ],
  }),
  component: TimelinePage,
});

const FILTERS = [
  { value: "upcoming", label: "Upcoming" },
  { value: "finished", label: "Finished" },
  { value: "all", label: "All" },
];

function TimelinePage() {
  const [filter, setFilter] = useState("upcoming");

  const matches = useQuery({
    queryKey: ["matches"],
    queryFn: () => api.get<Match[]>("/api/matches"),
  });

  const grouped = useMemo(() => {
    const list = (matches.data || [])
      .slice()
      .filter((m) => {
        if (filter === "upcoming") return m.status === "scheduled";
        if (filter === "finished") return m.status === "completed";
        return true;
      })
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
    const map = new Map<string, Match[]>();
    for (const m of list) {
      if (!map.has(m.date)) map.set(m.date, []);
      map.get(m.date)!.push(m);
    }
    return Array.from(map.entries());
  }, [matches.data, filter]);

  return (
    <SectionReveal delay={0.08} className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold mb-2">Timeline</h1>
      <p className="text-muted-foreground mb-6">Every match, day by day.</p>

      <div className="w-full sm:w-48 mb-6">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILTERS.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {matches.isLoading ? (
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, g) => (
            <div key={g} className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <div className="grid md:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <MatchCardSkeleton key={i} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">No matches match this filter.</p>
      ) : (
        <div className="relative pl-6 border-l border-border space-y-8">
          {grouped.map(([date, items]) => (
            <div key={date} className="relative">
              <div className="absolute -left-[31px] top-1 size-3 rounded-full bg-primary ring-4 ring-background" />
              <div className="text-sm font-semibold mb-3">
                {formatDate(date, "dddd, MMMM D, YYYY")}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                {items.map((m) => (
                  <MatchCard key={m._id} m={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionReveal>
  );
}

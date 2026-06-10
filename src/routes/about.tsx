import { createFileRoute } from "@tanstack/react-router";
import { Activity, CalendarClock, Radio, ShieldCheck, Trophy, Users } from "lucide-react";
import { SectionReveal } from "@/components/section-reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — CupVision" },
      { name: "description", content: "About CupVision: purpose, features and tech stack." },
      { property: "og:title", content: "About — CupVision" },
      { property: "og:description", content: "About CupVision: purpose, features and tech stack." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <SectionReveal delay={0.06} className="border-b border-border/70 pb-12">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
              About CupVision
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-foreground sm:text-5xl">
              Tournament coverage, structured with product discipline.
            </h1>
          </div>
          <div className="space-y-5 text-sm leading-7 text-muted-foreground sm:text-base">
            <p>
              CupVision is independent World Cup companion focused on clarity, speed, editorial
              control. Match state, standings, watch access, squads, timeline sit inside one system
              instead of fragmented tools.
            </p>
            <p>
              Data is curated by admins, not scraped from official FIFA APIs. That keeps publishing
              flexible, manual updates reliable, coverage tone fully controlled by product team.
            </p>
          </div>
        </div>
      </SectionReveal>

      <SectionReveal delay={0.14} className="py-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: Activity,
              title: "Live state",
              text: "Scheduled, live, completed match coverage with clear state handling.",
            },
            {
              icon: Radio,
              title: "Watch flow",
              text: "Admin-managed channels, featured streams, cleaner switching between feeds.",
            },
            {
              icon: CalendarClock,
              title: "Timeline logic",
              text: "Chronological structure for fixtures, progress, recent tournament movement.",
            },
            {
              icon: Users,
              title: "Team context",
              text: "Squads, standings, team breakdowns, tournament-wide metrics in one place.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-6"
            >
              <item.icon className="size-5 text-primary" />
              <h2 className="mt-4 text-lg font-black tracking-tight text-foreground">
                {item.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </SectionReveal>

      <SectionReveal delay={0.22} className="border-t border-border/70 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <h2 className="text-2xl font-black tracking-tight text-foreground">How system works</h2>
            <div className="mt-5 space-y-6 text-sm leading-7 text-muted-foreground">
              <div>
                <h3 className="font-semibold text-foreground">Editorial control</h3>
                <p className="mt-2">
                  Admin dashboard manages matches, teams, authors, imports, watch channels. Content
                  model stays practical for fast tournament operations.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Computed stats</h3>
                <p className="mt-2">
                  Standings and aggregate metrics are derived from match data rather than stored as
                  static snapshots. Less duplication, fewer sync errors.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Product intent</h3>
                <p className="mt-2">
                  Goal is not generic sports portal. Goal is focused World Cup board with better
                  scan speed, tighter structure, cleaner operations.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <ShieldCheck className="size-4" />
                Stack
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
                <li>
                  <span className="text-foreground">Frontend:</span> Vite, React, TypeScript,
                  TanStack Router, Tailwind CSS
                </li>
                <li>
                  <span className="text-foreground">Backend:</span> Node.js, Express, TypeScript
                </li>
                <li>
                  <span className="text-foreground">Data:</span> MongoDB Atlas with native driver
                </li>
              </ul>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))] p-6">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Trophy className="size-4" />
                Positioning
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Fan-built, admin-driven, operations-first tournament product with broad match
                coverage.
              </p>
            </div>
          </section>
        </div>
      </SectionReveal>
    </div>
  );
}

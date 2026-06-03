import { MetricCard } from "@/components/metric-card"
import { SectionCard } from "@/components/section-card"

const metrics = [
  { label: "Live Match", value: "0", hint: "Backend ready for live status feed." },
  { label: "Tracked Teams", value: "48", hint: "Structure aligned with World Cup 2026." },
  { label: "Import Flow", value: "CSV", hint: "Single-file admin import planned." },
]

export function HomePage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-cyan-300/20 bg-[linear-gradient(135deg,_rgba(8,145,178,0.18),_rgba(15,23,42,0.6))] p-8 shadow-[0_30px_80px_rgba(8,145,178,0.16)]">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-200/85">
            FIFA World Cup 2026 Tracker
          </p>
          <h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            One place for fixtures, results, standings, timeline, admin control.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-200">
            Frontend shell live. Backend auth live. Next phases: collections, CSV
            import, match management, public data views.
          </p>
        </div>
        <div className="grid gap-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Current Build"
          description="Project now has routed public pages, dark-first UI shell, backend API bootstrap, Mongo connection layer, default admin bootstrap, signed admin token login."
        />
        <SectionCard
          title="Next Execution Block"
          description="Phase 4-6 likely next: CSV ingestion, match CRUD, result handling, dynamic standings. Foundation now in place for those APIs."
        />
      </div>
    </div>
  )
}

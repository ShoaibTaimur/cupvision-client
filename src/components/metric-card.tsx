type MetricCardProps = {
  label: string
  value: string
  hint: string
}

export function MetricCard({ label, value, hint }: MetricCardProps) {
  return (
    <article className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_24px_60px_rgba(8,15,32,0.35)] backdrop-blur">
      <p className="text-sm uppercase tracking-[0.25em] text-cyan-200/70">{label}</p>
      <p className="mt-4 text-4xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-300">{hint}</p>
    </article>
  )
}

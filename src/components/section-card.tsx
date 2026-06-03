import { type ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description: string;
  children?: ReactNode;
};

export function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-slate-950/55 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.22)]">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">{description}</p>
      </div>
      {children}
    </section>
  );
}

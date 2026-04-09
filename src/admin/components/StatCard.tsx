type Props = {
  title: string;
  value: string;
  hint?: string;
};

export function StatCard({ title, value, hint }: Props) {
  return (
    <div className="rounded-2xl bg-panel-2 p-5 ring-1 ring-white/5">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}

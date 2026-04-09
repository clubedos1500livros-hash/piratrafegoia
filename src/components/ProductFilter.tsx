type Props = {
  value: string;
  onChange: (q: string) => void;
};

export function ProductFilter({ value, onChange }: Props) {
  return (
    <div className="relative">
      <span
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        aria-hidden
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </span>
      <input
        type="search"
        placeholder="Buscar no cardápio…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-panel-2 py-3 pl-11 pr-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none ring-accent/40 focus:border-accent/50 focus:ring-2"
      />
    </div>
  );
}

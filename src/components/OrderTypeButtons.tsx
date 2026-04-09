import type { OrderType } from '@/types/product';

const options: { id: OrderType; label: string }[] = [
  { id: 'mesa', label: 'Mesa' },
  { id: 'viagem', label: 'Viagem' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'retirada', label: 'Retirada' },
];

type Props = {
  value: OrderType;
  onChange: (t: OrderType) => void;
};

export function OrderTypeButtons({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`rounded-xl px-3 py-3 text-sm font-semibold transition ${
              active
                ? 'bg-accent text-white shadow-md shadow-accent/30'
                : 'bg-panel-2 text-zinc-300 ring-1 ring-white/10 hover:bg-white/5 hover:text-white'
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

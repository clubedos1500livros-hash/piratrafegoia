import { useRef } from 'react';

/** Ordem fixa dos CTAs (independe da API). IDs = slugs em `product.category`, exceto `todos` e `horario`. */
const CATEGORY_TAB_ORDER: { id: string; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'hamburguer', label: 'Hambúrguer' },
  { id: 'hot-dog', label: 'Hot-Dog' },
  { id: 'batata-frita', label: 'Batata Frita' },
  { id: 'super-batata', label: 'Super Batata' },
  { id: 'molhos', label: 'Molhos' },
  { id: 'bebidas', label: 'Bebidas' },
  { id: 'combos', label: 'Combos' },
  { id: 'horario', label: 'Horário' },
];

type Props = {
  value: string;
  onChange: (category: string) => void;
};

export function CategoryTabs({ value, onChange }: Props) {
  const buttonsRef = useRef(new Map<string, HTMLButtonElement>());

  const register =
    (id: string) =>
    (el: HTMLButtonElement | null): void => {
      const m = buttonsRef.current;
      if (el) m.set(id, el);
      else m.delete(id);
    };

  const handleSelect = (id: string) => {
    onChange(id);
    requestAnimationFrame(() => {
      buttonsRef.current.get(id)?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    });
  };

  return (
    <div className="min-w-0 w-full overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-3 py-2 whitespace-nowrap">
        {CATEGORY_TAB_ORDER.map((t) => {
          const active = value === t.id;
          return (
            <button
              key={t.id}
              ref={register(t.id)}
              type="button"
              onClick={() => handleSelect(t.id)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                active
                  ? 'scale-105 bg-accent text-white shadow-md'
                  : 'scale-100 bg-white/10 text-white/70 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

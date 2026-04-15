import { useMemo, useState } from 'react';
import { CategoryTabs } from '@/components/CategoryTabs';
import { HeaderLogo3D } from '@/components/HeaderLogo3D';
import { ProductCard } from '@/components/ProductCard';
import { ProductFilter } from '@/components/ProductFilter';
import { useProducts } from '@/context/ProductsContext';
import { getPublicRestaurantId } from '@/lib/tenant/publicTenant';
import { loadTenantDataOrLegacy } from '@/lib/admin/tenantDataRepo';

export function HomePage() {
  const { products, loading, error } = useProducts();
  const [category, setCategory] = useState<string>('todos');
  const [query, setQuery] = useState('');
  const [company] = useState(() => loadTenantDataOrLegacy(getPublicRestaurantId()).company);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (category === 'horario') return [];
    return products.filter((p) => {
      const catOk = category === 'todos' || p.category === category;
      const textOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q);
      return catOk && textOk;
    });
  }, [products, category, query]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-zinc-400">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        <p className="text-sm">Carregando cardápio…</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-300 ring-1 ring-red-500/20">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="relative left-1/2 h-[55vh] w-screen -translate-x-1/2 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-4 pt-4 sm:pt-6">
          {company.logo_image_url ? (
            <img
              src={company.logo_image_url}
              alt={company.name}
              className="mb-4 h-16 w-auto rounded-2xl border border-white/10 bg-black/50 object-contain"
            />
          ) : (
            <HeaderLogo3D className="drop-shadow-lg" />
          )}
        </div>

        <video
          className="h-full w-full scale-110 object-cover"
          autoPlay
          muted
          loop
          playsInline
          src={company.logo_video_url || '/video360.mp4'}
        />
      </div>

      <div className="px-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            O que vamos pedir hoje?
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Toque em uma categoria, busque pelo nome e abra o produto para ver detalhes.
          </p>
        </div>

        <CategoryTabs value={category} onChange={setCategory} />
      <ProductFilter value={query} onChange={setQuery} />

      {category === 'horario' ? (
        <div className="bg-panel-2 px-4 py-10 text-center">
          <p className="text-base font-semibold text-white">Horário de funcionamento</p>
          <p className="mt-2 text-sm text-zinc-400">
            Consulte nossas redes ou fale conosco para horários atualizados.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">Nenhum item encontrado.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
      </div>
    </div>
  );
}
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { OrderTypeButtons } from '@/components/OrderTypeButtons';
import { formatBRL } from '@/lib/money';
import { useCart } from '@/context/CartContext';
import { useProducts } from '@/context/ProductsContext';
import type { OrderType } from '@/types/product';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const { products, loading } = useProducts();
  const { addItem, setOpen } = useCart();
  const [orderType, setOrderType] = useState<OrderType>('mesa');
  const [qty, setQty] = useState(1);

  const product = useMemo(() => products.find((p) => p.id === id), [products, id]);

  if (loading && !products.length) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="rounded-2xl bg-panel p-8 text-center ring-1 ring-white/10">
        <p className="text-zinc-400">Produto não encontrado.</p>
        <Link
          to="/"
          className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
        >
          Voltar ao cardápio
        </Link>
      </div>
    );
  }

  const hasVideo = Boolean(product.video_url);

  const handleAdd = () => {
    addItem(product, orderType, qty);
    setOpen(true);
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1 text-sm text-zinc-400 hover:text-accent"
      >
        <span aria-hidden>←</span> Voltar
      </Link>

      <div className="overflow-hidden rounded-2xl bg-panel ring-1 ring-white/10">
        {hasVideo ? (
          <video
            className="aspect-video w-full bg-black object-cover"
            src={product.video_url ?? undefined}
            controls
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={product.image_url}
            alt=""
            className="aspect-video w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{product.name}</h1>
          <p className="mt-2 text-zinc-400">{product.description}</p>
          <p className="mt-4 text-2xl font-bold text-accent">{formatBRL(product.price)}</p>
        </div>

        {product.ingredients?.length ? (
          <div className="rounded-2xl bg-panel-2 p-5 ring-1 ring-white/5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
              Ingredientes
            </h2>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-zinc-300">
              {product.ingredients.map((ing) => (
                <li key={ing}>{ing}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="rounded-2xl bg-panel-2 p-5 ring-1 ring-white/5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
            Como você quer pedir?
          </h2>
          <div className="mt-3">
            <OrderTypeButtons value={orderType} onChange={setOrderType} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-panel-2 p-1 ring-1 ring-white/10">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-white hover:bg-white/10"
              aria-label="Menos"
            >
              −
            </button>
            <span className="min-w-[2rem] text-center font-medium">{qty}</span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-lg text-white hover:bg-white/10"
              aria-label="Mais"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 min-w-[200px] rounded-xl bg-accent py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </div>
  );
}

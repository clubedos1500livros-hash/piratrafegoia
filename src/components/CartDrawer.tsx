import { formatBRL } from '@/lib/money';
import { useCart } from '@/context/CartContext';

const orderShort: Record<string, string> = {
  mesa: 'Mesa',
  viagem: 'Viagem',
  delivery: 'Delivery',
  retirada: 'Retirada',
};

export function CartDrawer() {
  const {
    items,
    isOpen,
    setOpen,
    increment,
    decrement,
    removeLine,
    subtotal,
    sendWhatsApp,
    clear,
  } = useCart();

  if (!isOpen) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        aria-label="Fechar carrinho"
        onClick={() => setOpen(false)}
      />
      <aside
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-white/10 bg-panel shadow-2xl shadow-black/50"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 id="cart-title" className="text-lg font-semibold text-white">
            Carrinho
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/5 hover:text-white"
            aria-label="Fechar"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">Seu carrinho está vazio.</p>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((line) => (
                <li
                  key={`${line.product.id}-${line.orderType}`}
                  className="flex gap-3 rounded-xl bg-panel-2 p-3 ring-1 ring-white/5"
                >
                  <img
                    src={line.product.image_url}
                    alt=""
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-white">{line.product.name}</p>
                    <p className="text-xs text-accent">{orderShort[line.orderType]}</p>
                    <p className="text-sm text-zinc-400">{formatBRL(line.product.price)} un.</p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decrement(line.product.id, line.orderType)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight text-white hover:bg-white/10"
                        aria-label="Menos"
                      >
                        −
                      </button>
                      <span className="min-w-[2ch] text-center text-sm font-medium">
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => increment(line.product.id, line.orderType)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-midnight text-white hover:bg-white/10"
                        aria-label="Mais"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => removeLine(line.product.id, line.orderType)}
                        className="ml-auto text-xs text-zinc-500 underline hover:text-red-400"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-white/10 bg-midnight/80 px-5 py-4 backdrop-blur-md">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span className="text-zinc-400">Total</span>
            <span className="text-xl font-bold text-white">{formatBRL(subtotal)}</span>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={!items.length}
              onClick={() => {
                sendWhatsApp();
                setOpen(false);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Pedir no WhatsApp
            </button>
            {items.length > 0 ? (
              <button
                type="button"
                onClick={() => clear()}
                className="text-center text-sm text-zinc-500 hover:text-zinc-300"
              >
                Limpar carrinho
              </button>
            ) : null}
          </div>
        </div>
      </aside>
    </>
  );
}

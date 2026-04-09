import { useTenant } from '@/admin/tenant/TenantContext';
import { useOrdersRealtime } from '@/lib/admin/hooks/useOrdersRealtime';
import { appendOrderAsync, updateOrderStatusAsync } from '@/lib/admin/ordersRepo';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { AdminOrder, OrderStatus } from '@/lib/admin/types';
import { formatBRL } from '@/lib/money';

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  completed: 'Concluído',
};

const statusClass: Record<OrderStatus, string> = {
  pending: 'bg-amber-500/20 text-amber-300 ring-amber-500/30',
  preparing: 'bg-sky-500/20 text-sky-300 ring-sky-500/30',
  completed: 'bg-emerald-500/20 text-emerald-300 ring-emerald-500/30',
};

function simulateOrder(restaurantId: string): AdminOrder {
  const id = isSupabaseConfigured() ? crypto.randomUUID() : `o${Date.now()}`;
  return {
    id,
    restaurant_id: restaurantId,
    created_at: new Date().toISOString(),
    status: 'pending',
    payment_type: 'pix',
    fulfillment_type: 'delivery',
    customer_name: 'Pedido simulado',
    customer_phone: '',
    items: [{ name: 'Item demo', quantity: 1, unit_price: 29.9 }],
    total: 29.9,
  };
}

export function OrdersPage() {
  const { restaurantId } = useTenant();
  const orders = useOrdersRealtime(restaurantId);

  function setStatus(id: string, s: OrderStatus) {
    void updateOrderStatusAsync(restaurantId, id, s);
  }

  function addDemo() {
    void appendOrderAsync(restaurantId, simulateOrder(restaurantId));
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedidos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            {isSupabaseConfigured()
              ? 'Atualização em tempo real (Supabase Realtime) com re-sync periódico.'
              : 'Lista atualizada por polling (~3s) e eventos entre abas.'}
          </p>
        </div>
        <button
          type="button"
          onClick={addDemo}
          className="rounded-xl bg-panel-2 px-4 py-3 text-sm font-medium text-white ring-1 ring-white/10 hover:ring-accent/40"
        >
          Simular novo pedido
        </button>
      </div>

      <ul className="flex flex-col gap-4">
        {orders.map((o) => (
          <li
            key={o.id}
            className="rounded-2xl bg-panel-2 p-5 ring-1 ring-white/5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-zinc-500">{o.id}</p>
                <p className="text-sm text-zinc-400">
                  {new Date(o.created_at).toLocaleString('pt-BR')}
                </p>
                <p className="mt-1 font-medium text-white">
                  {o.customer_name || '—'}{' '}
                  {o.customer_phone ? (
                    <span className="text-zinc-500">· {o.customer_phone}</span>
                  ) : null}
                </p>
                <ul className="mt-2 text-sm text-zinc-400">
                  {o.items.map((it, i) => (
                    <li key={i}>
                      {it.name} × {it.quantity} — {formatBRL(it.unit_price * it.quantity)}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-lg font-bold text-accent">{formatBRL(o.total)}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Pagamento: {o.payment_type} · Tipo: {o.fulfillment_type}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass[o.status]}`}
              >
                {statusLabel[o.status]}
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(['pending', 'preparing', 'completed'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={o.status === s}
                  onClick={() => setStatus(o.id, s)}
                  className="rounded-lg bg-midnight px-3 py-2 text-xs font-medium text-zinc-300 ring-1 ring-white/10 hover:text-accent disabled:opacity-40"
                >
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
      {orders.length === 0 ? (
        <p className="text-center text-sm text-zinc-500">Nenhum pedido ainda.</p>
      ) : null}
    </div>
  );
}

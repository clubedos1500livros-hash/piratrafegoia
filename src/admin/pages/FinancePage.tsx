import { useMemo } from 'react';
import { useTenant } from '@/admin/tenant/TenantContext';
import { useOrdersRealtime } from '@/lib/admin/hooks/useOrdersRealtime';
import { ordersToReportRows, summarizeFinance } from '@/lib/admin/finance';
import { exportFinanceExcel } from '@/lib/export/reportExcel';
import { exportFinancePdf } from '@/lib/export/reportPdf';
import { StatCard } from '@/admin/components/StatCard';
import { formatBRL } from '@/lib/money';

export function FinancePage() {
  const { restaurantId } = useTenant();
  const orders = useOrdersRealtime(restaurantId);

  const summary = useMemo(() => summarizeFinance(orders), [orders]);
  const rows = useMemo(() => ordersToReportRows(orders), [orders]);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Financeiro</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Faturamento considera apenas pedidos com status <strong className="text-zinc-300">concluído</strong>.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => exportFinanceExcel(summary, rows)}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Exportar Excel
          </button>
          <button
            type="button"
            onClick={() => exportFinancePdf(summary, rows)}
            className="rounded-xl bg-panel-2 px-4 py-2 text-sm font-semibold text-accent ring-1 ring-accent/40 hover:bg-accent/10"
          >
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total de vendas" value={formatBRL(summary.total_sales)} />
        <StatCard title="Pedidos (todos)" value={String(summary.order_count)} />
        <StatCard title="Pedidos concluídos" value={String(summary.completed_count)} />
        <StatCard
          title="Ticket médio"
          value={
            summary.completed_count
              ? formatBRL(summary.total_sales / summary.completed_count)
              : '—'
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-panel-2 p-6 ring-1 ring-white/5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
            Forma de pagamento
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between text-zinc-300">
              <span>Dinheiro</span>
              <span className="font-medium text-white">{formatBRL(summary.by_payment.cash)}</span>
            </li>
            <li className="flex justify-between text-zinc-300">
              <span>PIX</span>
              <span className="font-medium text-white">{formatBRL(summary.by_payment.pix)}</span>
            </li>
            <li className="flex justify-between text-zinc-300">
              <span>Cartão</span>
              <span className="font-medium text-white">{formatBRL(summary.by_payment.card)}</span>
            </li>
          </ul>
        </div>
        <div className="rounded-2xl bg-panel-2 p-6 ring-1 ring-white/5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-accent">
            Tipo de pedido
          </h2>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between text-zinc-300">
              <span>Mesa</span>
              <span className="font-medium text-white">{formatBRL(summary.by_fulfillment.table)}</span>
            </li>
            <li className="flex justify-between text-zinc-300">
              <span>Delivery</span>
              <span className="font-medium text-white">
                {formatBRL(summary.by_fulfillment.delivery)}
              </span>
            </li>
            <li className="flex justify-between text-zinc-300">
              <span>Retirada</span>
              <span className="font-medium text-white">{formatBRL(summary.by_fulfillment.pickup)}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

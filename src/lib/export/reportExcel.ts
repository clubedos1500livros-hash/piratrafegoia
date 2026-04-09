import * as XLSX from 'xlsx';
import type { FinanceSummary } from '@/lib/admin/finance';
import type { FinancialReportRow } from '@/lib/admin/types';

export function exportFinanceExcel(
  summary: FinanceSummary,
  rows: FinancialReportRow[],
  filename = 'relatorio-financeiro.xlsx',
): void {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['Resumo financeiro'],
    ['Total vendas (concluídos)', summary.total_sales],
    ['Pedidos no período', summary.order_count],
    ['Pedidos concluídos', summary.completed_count],
    [],
    ['Pagamento', 'Valor'],
    ['Dinheiro', summary.by_payment.cash],
    ['PIX', summary.by_payment.pix],
    ['Cartão', summary.by_payment.card],
    [],
    ['Tipo de pedido', 'Valor'],
    ['Mesa', summary.by_fulfillment.table],
    ['Delivery', summary.by_fulfillment.delivery],
    ['Retirada', summary.by_fulfillment.pickup],
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');

  const detail = rows.map((r) => ({
    Restaurante: r.restaurant_id,
    Pedido: r.order_id,
    Data: r.date,
    Total: r.total,
    Pagamento: r.payment_type,
    Tipo: r.fulfillment_type,
    Status: r.status,
  }));
  const ws2 = XLSX.utils.json_to_sheet(detail);
  XLSX.utils.book_append_sheet(wb, ws2, 'Pedidos');

  XLSX.writeFile(wb, filename);
}

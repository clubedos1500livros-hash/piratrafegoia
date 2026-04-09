import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { FinanceSummary } from '@/lib/admin/finance';
import type { FinancialReportRow } from '@/lib/admin/types';

type DocWithTable = jsPDF & { lastAutoTable?: { finalY: number } };

export function exportFinancePdf(
  summary: FinanceSummary,
  rows: FinancialReportRow[],
  filename = 'relatorio-financeiro.pdf',
): void {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Relatório financeiro', 14, 18);
  doc.setFontSize(10);
  doc.text(`Total vendas (concluídos): R$ ${summary.total_sales.toFixed(2)}`, 14, 28);
  doc.text(`Pedidos no período: ${summary.order_count}`, 14, 34);
  doc.text(`Pedidos concluídos: ${summary.completed_count}`, 14, 40);

  autoTable(doc, {
    startY: 46,
    head: [['Forma de pagamento', 'Valor (R$)']],
    body: [
      ['Dinheiro', summary.by_payment.cash.toFixed(2)],
      ['PIX', summary.by_payment.pix.toFixed(2)],
      ['Cartão', summary.by_payment.card.toFixed(2)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
  });

  let y = ((doc as DocWithTable).lastAutoTable?.finalY ?? 46) + 12;
  doc.text('Por tipo de pedido', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Tipo', 'Valor (R$)']],
    body: [
      ['Mesa', summary.by_fulfillment.table.toFixed(2)],
      ['Delivery', summary.by_fulfillment.delivery.toFixed(2)],
      ['Retirada', summary.by_fulfillment.pickup.toFixed(2)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
  });

  y = ((doc as DocWithTable).lastAutoTable?.finalY ?? y) + 14;
  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  doc.text('Detalhamento de pedidos', 14, y);
  autoTable(doc, {
    startY: y + 4,
    head: [['Rest.', 'ID', 'Data', 'Total', 'Pag.', 'Tipo', 'Status']],
    body: rows.map((r) => [
      r.restaurant_id,
      r.order_id,
      r.date,
      r.total.toFixed(2),
      r.payment_type,
      r.fulfillment_type,
      r.status,
    ]),
    styles: { fontSize: 8 },
    headStyles: { fillColor: [249, 115, 22] },
  });

  doc.save(filename);
}

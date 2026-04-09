import type {
  AdminOrder,
  FinancialReportRow,
  FulfillmentType,
  PaymentType,
} from '@/lib/admin/types';

export type FinanceSummary = {
  total_sales: number;
  order_count: number;
  by_payment: Record<PaymentType, number>;
  by_fulfillment: Record<FulfillmentType, number>;
  /** Pedidos considerados na receita */
  completed_count: number;
};

function emptyPayment(): Record<PaymentType, number> {
  return { cash: 0, pix: 0, card: 0 };
}

function emptyFulfillment(): Record<FulfillmentType, number> {
  return { table: 0, delivery: 0, pickup: 0 };
}

/** Apenas pedidos *completed* entram no faturamento. */
export function summarizeFinance(orders: AdminOrder[]): FinanceSummary {
  const completed = orders.filter((o) => o.status === 'completed');
  const by_payment = emptyPayment();
  const by_fulfillment = emptyFulfillment();
  let total_sales = 0;

  for (const o of completed) {
    total_sales += o.total;
    by_payment[o.payment_type] += o.total;
    by_fulfillment[o.fulfillment_type] += o.total;
  }

  return {
    total_sales,
    order_count: orders.length,
    completed_count: completed.length,
    by_payment,
    by_fulfillment,
  };
}

export function ordersToReportRows(orders: AdminOrder[]): FinancialReportRow[] {
  return orders.map((o) => ({
    order_id: o.id,
    restaurant_id: o.restaurant_id,
    date: new Date(o.created_at).toLocaleString('pt-BR'),
    total: o.total,
    payment_type: o.payment_type,
    fulfillment_type: o.fulfillment_type,
    status: o.status,
  }));
}

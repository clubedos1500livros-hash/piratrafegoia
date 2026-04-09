import { getWhatsAppConfig } from '@/lib/admin/whatsappRepo';
import { getPublicRestaurantId } from '@/lib/tenant/publicTenant';
import type { OrderType } from '@/types/product';

const orderLabels: Record<OrderType, string> = {
  mesa: 'No local (mesa)',
  viagem: 'Para viagem',
  delivery: 'Delivery',
  retirada: 'Retirada',
};

export type WhatsAppLine = {
  name: string;
  quantity: number;
  unitPrice: number;
  orderType: OrderType;
};

function formatMoney(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function buildOrderMessageForTenant(restaurantId: string, lines: WhatsAppLine[]): string {
  const cfg = getWhatsAppConfig(restaurantId);
  const titleLine = cfg.order_summary_intro.trim()
    ? `*${cfg.order_summary_intro}*`
    : '*Novo pedido — Cardápio digital*';
  const header = `${titleLine}\n`;
  const body = lines
    .map((l, i) => {
      const sub = l.unitPrice * l.quantity;
      return (
        `${i + 1}. ${l.name} x${l.quantity}\n` +
        `   ${orderLabels[l.orderType]}\n` +
        `   ${formatMoney(sub)}`
      );
    })
    .join('\n\n');

  const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  let footer = `\n\n*Total:* ${formatMoney(total)}`;
  if (cfg.cart_footer_message.trim()) {
    footer += `\n\n_${cfg.cart_footer_message}_`;
  }

  return header + body + footer;
}

export function buildOrderMessage(lines: WhatsAppLine[]): string {
  return buildOrderMessageForTenant(getPublicRestaurantId(), lines);
}

export function openWhatsAppWithText(message: string): void {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '';
  if (!raw) {
    window.alert(
      'Configure VITE_WHATSAPP_NUMBER no arquivo .env (apenas dígitos, com DDI).',
    );
    return;
  }
  window.open(
    `https://wa.me/${raw}?text=${encodeURIComponent(message)}`,
    '_blank',
    'noopener,noreferrer',
  );
}

export function openWhatsAppOrder(lines: WhatsAppLine[]): void {
  const raw = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '';
  if (!raw) {
    window.alert(
      'Configure VITE_WHATSAPP_NUMBER no arquivo .env (apenas dígitos, com DDI).',
    );
    return;
  }

  const text = encodeURIComponent(buildOrderMessage(lines));
  window.open(`https://wa.me/${raw}?text=${text}`, '_blank', 'noopener,noreferrer');
}

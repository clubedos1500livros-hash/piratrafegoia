import { scopeWhatsAppConfig } from '@/lib/restaurant/scope';
import { loadJson, saveJson } from '@/lib/admin/jsonStorage';
import { emitAdminHub } from '@/lib/tenant/events';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import type { WhatsAppBotConfig } from '@/lib/admin/types';

function defaults(restaurantId: string): WhatsAppBotConfig {
  return {
    restaurant_id: restaurantId,
    welcome_message:
      'Olá! Bem-vindo ao nosso cardápio digital. Digite *menu* para ver opções ou envie seu pedido.',
    order_summary_intro: 'Resumo do seu pedido:',
    cart_footer_message: 'Total do carrinho enviado pelo app.',
    webhook_url_placeholder: '',
  };
}

export function getWhatsAppConfig(restaurantId: string): WhatsAppBotConfig {
  const k = buildTenantStorageKeys(restaurantId);
  const raw = loadJson<WhatsAppBotConfig>(k.whatsapp, defaults(k.restaurantId));
  return scopeWhatsAppConfig({ ...defaults(k.restaurantId), ...raw }, k.restaurantId);
}

export function saveWhatsAppConfig(restaurantId: string, c: WhatsAppBotConfig): void {
  const k = buildTenantStorageKeys(restaurantId);
  saveJson(k.whatsapp, scopeWhatsAppConfig(c, k.restaurantId));
  emitAdminHub(k.restaurantId, 'whatsapp');
}

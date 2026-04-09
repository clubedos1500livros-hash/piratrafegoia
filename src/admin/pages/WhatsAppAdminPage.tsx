import { useEffect, useState } from 'react';
import { useTenant } from '@/admin/tenant/TenantContext';
import { getWhatsAppConfig, saveWhatsAppConfig } from '@/lib/admin/whatsappRepo';
import { buildOrderMessageForTenant, openWhatsAppWithText, type WhatsAppLine } from '@/lib/whatsapp';
import type { OrderType } from '@/types/product';

export function WhatsAppAdminPage() {
  const { restaurantId } = useTenant();
  const [cfg, setCfg] = useState(() => getWhatsAppConfig(restaurantId));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCfg(getWhatsAppConfig(restaurantId));
  }, [restaurantId]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    saveWhatsAppConfig(restaurantId, cfg);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  function openChat() {
    const msg = cfg.welcome_message.trim() || 'Olá!';
    openWhatsAppWithText(msg);
  }

  function previewOrderSummary() {
    const demo: WhatsAppLine[] = [
      {
        name: 'Produto exemplo',
        quantity: 2,
        unitPrice: 15,
        orderType: 'mesa' as OrderType,
      },
    ];
    const text = buildOrderMessageForTenant(restaurantId, demo);
    openWhatsAppWithText(text);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">WhatsApp</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Configurações do restaurante <code className="text-accent">{restaurantId}</code>. O cardápio
          público usa <code className="text-accent">VITE_PUBLIC_TENANT_ID</code> como{' '}
          <code className="text-accent">restaurant_id</code>.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={openChat}
          className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:brightness-110"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Abrir conversa no WhatsApp
        </button>
        <button
          type="button"
          onClick={previewOrderSummary}
          className="rounded-xl bg-panel-2 px-5 py-3 text-sm font-medium text-white ring-1 ring-white/10 hover:ring-accent/40"
        >
          Prévia: resumo de pedido
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 rounded-2xl bg-panel-2 p-6 ring-1 ring-white/5">
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Mensagem de boas-vindas (chatbot / atendimento)</span>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white"
            value={cfg.welcome_message}
            onChange={(e) => setCfg({ ...cfg, welcome_message: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Título do resumo do pedido (substitui o padrão se preenchido)</span>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white"
            value={cfg.order_summary_intro}
            onChange={(e) => setCfg({ ...cfg, order_summary_intro: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Rodapé ao enviar carrinho pelo app</span>
          <textarea
            rows={2}
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white"
            value={cfg.cart_footer_message}
            onChange={(e) => setCfg({ ...cfg, cart_footer_message: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Webhook do chatbot (futuro)</span>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-zinc-400"
            value={cfg.webhook_url_placeholder}
            onChange={(e) => setCfg({ ...cfg, webhook_url_placeholder: e.target.value })}
            placeholder="https://... (Supabase Edge Function / n8n)"
          />
        </label>
        <p className="text-xs text-zinc-500">
          O número do WhatsApp do estabelecimento vem de{' '}
          <code className="text-accent">VITE_WHATSAPP_NUMBER</code> no <code>.env</code>.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Salvar configurações
          </button>
          {saved ? <span className="text-sm text-emerald-400">Salvo.</span> : null}
        </div>
      </form>
    </div>
  );
}

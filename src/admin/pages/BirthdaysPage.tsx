import { useCallback, useEffect, useState } from 'react';
import { useTenant } from '@/admin/tenant/TenantContext';
import {
  customersWithBirthdayToday,
  fetchCustomers,
  getCustomers,
} from '@/lib/admin/customersRepo';
import { isSupabaseConfigured } from '@/lib/supabase';
import { ADMIN_HUB, type AdminHubDetail } from '@/lib/tenant/events';
import type { Customer } from '@/lib/admin/types';
import { openWhatsAppWithText } from '@/lib/whatsapp';

export function BirthdaysPage() {
  const { restaurantId } = useTenant();
  const [customers, setCustomers] = useState<Customer[]>(() =>
    isSupabaseConfigured() ? [] : getCustomers(restaurantId),
  );

  const load = useCallback(() => {
    if (isSupabaseConfigured()) {
      void fetchCustomers(restaurantId).then(setCustomers);
    } else {
      setCustomers(getCustomers(restaurantId));
    }
  }, [restaurantId]);

  useEffect(() => {
    load();
    const onHub = (e: Event) => {
      const d = (e as CustomEvent<AdminHubDetail>).detail;
      if (d?.restaurantId === restaurantId && d?.scope === 'customers') load();
    };
    window.addEventListener(ADMIN_HUB, onHub);
    return () => window.removeEventListener(ADMIN_HUB, onHub);
  }, [restaurantId, load]);

  const today = customersWithBirthdayToday(customers);

  function sendCoupon(c: { name: string; phone: string }) {
    const msg =
      `Olá, ${c.name.split(' ')[0]}! 🎉 Feliz aniversário!\n\n` +
      `Segue um cupom especial de *10% OFF* válido hoje no nosso restaurante.\n` +
      `Responda esta mensagem para resgatar.`;
    const digits = c.phone.replace(/\D/g, '');
    const store = import.meta.env.VITE_WHATSAPP_NUMBER?.replace(/\D/g, '') ?? '';
    if (digits && store) {
      window.open(
        `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`,
        '_blank',
        'noopener,noreferrer',
      );
    } else {
      openWhatsAppWithText(msg);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Aniversários</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Clientes do restaurante <code className="text-accent">{restaurantId}</code> com aniversário hoje (
          {new Date().toLocaleDateString('pt-BR')}).
        </p>
      </div>

      <button
        type="button"
        onClick={() => load()}
        className="rounded-lg text-sm text-accent hover:underline"
      >
        Atualizar lista
      </button>

      {today.length === 0 ? (
        <p className="rounded-2xl bg-panel-2 p-8 text-center text-sm text-zinc-500 ring-1 ring-white/5">
          Nenhum aniversariante hoje.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {today.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-4 rounded-2xl bg-panel-2 p-5 ring-1 ring-white/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{c.name}</p>
                <p className="text-sm text-zinc-500">{c.phone}</p>
                <p className="text-xs text-zinc-600">{c.birth_date}</p>
              </div>
              <button
                type="button"
                onClick={() => sendCoupon(c)}
                className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover"
              >
                Enviar cupom (WhatsApp)
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

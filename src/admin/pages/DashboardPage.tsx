import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/admin/components/StatCard';
import { adminModules } from '@/admin/modules/registry';
import { useTenant } from '@/admin/tenant/TenantContext';
import { summarizeFinance } from '@/lib/admin/finance';
import { useOrdersRealtime } from '@/lib/admin/hooks/useOrdersRealtime';
import { customersWithBirthdayToday, fetchCustomers, getCustomers } from '@/lib/admin/customersRepo';
import { isSupabaseConfigured } from '@/lib/supabase';
import { ADMIN_HUB, type AdminHubDetail } from '@/lib/tenant/events';
import type { Customer } from '@/lib/admin/types';
import { formatBRL } from '@/lib/money';

const shortcutIds = new Set([
  'company',
  'products',
  'combos',
  'orders',
  'customers',
  'finance',
]);

export function DashboardPage() {
  const { restaurantId } = useTenant();
  const base = `/admin/${restaurantId}`;
  const orders = useOrdersRealtime(restaurantId);
  const summary = summarizeFinance(orders);

  const [customers, setCustomers] = useState<Customer[]>(() =>
    isSupabaseConfigured() ? [] : getCustomers(restaurantId),
  );

  const loadCustomers = useCallback(() => {
    if (isSupabaseConfigured()) {
      void fetchCustomers(restaurantId).then(setCustomers);
    } else {
      setCustomers(getCustomers(restaurantId));
    }
  }, [restaurantId]);

  useEffect(() => {
    loadCustomers();
    const onHub = (e: Event) => {
      const d = (e as CustomEvent<AdminHubDetail>).detail;
      if (d?.restaurantId === restaurantId && d?.scope === 'customers') loadCustomers();
    };
    window.addEventListener(ADMIN_HUB, onHub);
    return () => window.removeEventListener(ADMIN_HUB, onHub);
  }, [restaurantId, loadCustomers]);

  const birthdays = customersWithBirthdayToday(customers);
  const pending = orders.filter((o) => o.status === 'pending').length;

  const shortcuts = adminModules.filter((m) => shortcutIds.has(m.id));

  const descriptions: Record<string, string> = {
    company: 'Nome, endereço, logo e horário',
    products: 'CRUD do cardápio',
    combos: 'Pacotes e preço especial',
    orders: 'Tempo real e status',
    customers: 'Cadastro completo',
    finance: 'Relatórios e exportação',
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Visão geral</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Resumo do negócio e atalhos para cada módulo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Vendas (concluídos)" value={formatBRL(summary.total_sales)} />
        <StatCard title="Pedidos totais" value={String(summary.order_count)} />
        <StatCard title="Pendentes" value={String(pending)} hint="Aguardando ação" />
        <StatCard title="Aniversariantes hoje" value={String(birthdays.length)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map((m) => (
          <Link
            key={m.id}
            to={`${base}/${m.path}`}
            className="rounded-2xl bg-panel-2 p-5 ring-1 ring-white/5 transition hover:ring-accent/40"
          >
            <p className="font-semibold text-white">{m.label}</p>
            <p className="mt-1 text-sm text-zinc-500">{descriptions[m.id] ?? m.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

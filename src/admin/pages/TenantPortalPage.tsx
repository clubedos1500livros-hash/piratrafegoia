import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { isSupabaseConfigured } from '@/lib/supabase';
import {
  ensureDefaultTenants,
  listRestaurantsUnified,
  registerRestaurantUnified,
} from '@/lib/tenant/registry';
import type { TenantRecord } from '@/lib/tenant/types';
import { sanitizeTenantId } from '@/lib/tenant/publicTenant';

export function TenantPortalPage() {
  const [tenants, setTenants] = useState<TenantRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      ensureDefaultTenants();
    }
    const list = await listRestaurantsUnified();
    setTenants(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const id = sanitizeTenantId(slug || name);
    if (!id) {
      setErr('Use um identificador com letras minúsculas, números ou hífen (mín. 2 caracteres).');
      return;
    }
    const row = await registerRestaurantUnified(id, name || id);
    if (!row) {
      setErr('Este identificador já existe.');
      return;
    }
    setSlug('');
    setName('');
    await reload();
  }

  return (
    <div className="min-h-dvh bg-midnight px-4 py-10 text-zinc-100">
      <div className="mx-auto max-w-lg space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-accent">SaaS multi-tenant</p>
          <h1 className="mt-2 text-2xl font-bold text-white">Escolha o cliente</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Cada restaurante tem dados isolados por{' '}
            <code className="text-accent">restaurant_id</code>
            {isSupabaseConfigured() ? ' no Supabase.' : ' (localStorage neste modo).'}
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-2xl bg-panel-2 p-6 ring-1 ring-white/5"
        >
          <p className="text-sm font-medium text-white">Novo cliente</p>
          <input
            placeholder="Identificador (ex.: meu-restaurante)"
            className="w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-sm text-white"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <input
            placeholder="Nome exibido (opcional)"
            className="w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-sm text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {err ? <p className="text-sm text-red-400">{err}</p> : null}
          <button
            type="submit"
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white hover:bg-accent-hover"
          >
            Cadastrar tenant
          </button>
        </form>

        {loading ? (
          <p className="text-center text-sm text-zinc-500">Carregando restaurantes…</p>
        ) : null}

        <ul className="space-y-2">
          {tenants.map((t) => (
            <li key={t.id}>
              <Link
                to={`/admin/${t.id}/dashboard`}
                className="flex items-center justify-between rounded-2xl bg-panel px-5 py-4 ring-1 ring-white/5 transition hover:ring-accent/40"
              >
                <div>
                  <p className="font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.id}</p>
                </div>
                <span className="text-accent">→</span>
              </Link>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="block text-center text-sm text-zinc-500 hover:text-accent"
        >
          Voltar ao cardápio público
        </Link>
      </div>
    </div>
  );
}

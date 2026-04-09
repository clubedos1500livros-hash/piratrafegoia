import { useEffect, useState } from 'react';
import { getCompany, saveCompany } from '@/lib/admin/companyRepo';
import { useTenant } from '@/admin/tenant/TenantContext';
import type { CompanySettings } from '@/lib/admin/types';

export function CompanySettingsPage() {
  const { restaurantId } = useTenant();
  const [form, setForm] = useState<CompanySettings>(() => getCompany(restaurantId));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setForm(getCompany(restaurantId));
  }, [restaurantId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveCompany(restaurantId, form);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dados iniciais</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Dados do restaurante <code className="text-accent">{restaurantId}</code> (
          <code className="text-accent">restaurant_id</code> nos registros). No Supabase, filtre por{' '}
          <code className="text-accent">restaurant_id</code>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-panel-2 p-6 ring-1 ring-white/5">
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Nome</span>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white outline-none focus:ring-2 focus:ring-accent/50"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Endereço</span>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white outline-none focus:ring-2 focus:ring-accent/50"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Telefone</span>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white outline-none focus:ring-2 focus:ring-accent/50"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Horário de funcionamento</span>
          <textarea
            rows={4}
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white outline-none focus:ring-2 focus:ring-accent/50"
            value={form.business_hours}
            onChange={(e) => setForm({ ...form, business_hours: e.target.value })}
            placeholder="Uma linha por faixa ou dia"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Logo — imagem (URL)</span>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white outline-none focus:ring-2 focus:ring-accent/50"
            value={form.logo_image_url}
            onChange={(e) => setForm({ ...form, logo_image_url: e.target.value })}
            placeholder="https://..."
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-300">Logo — vídeo 3D / animação (URL)</span>
          <input
            className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-4 py-3 text-white outline-none focus:ring-2 focus:ring-accent/50"
            value={form.logo_video_url}
            onChange={(e) => setForm({ ...form, logo_video_url: e.target.value })}
            placeholder="https://.../logo.mp4"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            className="rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover"
          >
            Salvar
          </button>
          {saved ? <span className="text-sm text-emerald-400">Salvo.</span> : null}
        </div>
      </form>
    </div>
  );
}

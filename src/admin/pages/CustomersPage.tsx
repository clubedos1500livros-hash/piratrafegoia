import { useEffect, useState } from 'react';
import { useTenant } from '@/admin/tenant/TenantContext';
import {
  fetchCustomers,
  newCustomerId,
  persistCustomers,
} from '@/lib/admin/customersRepo';
import type { Customer } from '@/lib/admin/types';

export function CustomersPage() {
  const { restaurantId } = useTenant();
  const [list, setList] = useState<Customer[]>([]);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetchCustomers(restaurantId).then((rows) => {
      if (!cancelled) setList(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  function persist(next: Customer[]) {
    setList(next);
    void persistCustomers(restaurantId, next);
  }

  function openNew() {
    setEditing({
      id: newCustomerId(list),
      restaurant_id: restaurantId,
      name: '',
      address: '',
      phone: '',
      birth_date: '',
    });
    setShowForm(true);
  }

  function openEdit(c: Customer) {
    setEditing({ ...c });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const customer = { ...editing, restaurant_id: restaurantId };
    const next = list.some((c) => c.id === customer.id)
      ? list.map((c) => (c.id === customer.id ? customer : c))
      : [...list, customer];
    persist(next);
    closeForm();
  }

  function handleDelete(id: string) {
    if (!window.confirm('Excluir cliente?')) return;
    persist(list.filter((c) => c.id !== id));
    closeForm();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clientes</h1>
          <p className="mt-1 text-sm text-zinc-400">Nome, endereço, telefone e data de nascimento.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover"
        >
          Novo cliente
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        <table className="hidden w-full text-left text-sm md:table">
          <thead className="bg-panel-2 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Telefone</th>
              <th className="px-4 py-3">Nascimento</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-panel">
            {list.map((c) => (
              <tr key={c.id} className="text-zinc-300">
                <td className="px-4 py-3 font-medium text-white">{c.name}</td>
                <td className="px-4 py-3">{c.phone}</td>
                <td className="px-4 py-3">{c.birth_date || '—'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="text-sm text-accent hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="divide-y divide-white/5 md:hidden">
          {list.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-2 bg-panel p-4">
              <div>
                <p className="font-medium text-white">{c.name}</p>
                <p className="text-xs text-zinc-500">{c.phone}</p>
              </div>
              <button type="button" onClick={() => openEdit(c)} className="text-sm text-accent">
                Editar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {showForm && editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl bg-panel-2 p-6 ring-1 ring-white/10">
            <h2 className="text-lg font-semibold text-white">Cliente</h2>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              <label className="block text-sm">
                <span className="text-zinc-400">Nome</span>
                <input
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Endereço</span>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.address}
                  onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Telefone</span>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.phone}
                  onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Data de nascimento</span>
                <input
                  type="date"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.birth_date}
                  onChange={(e) => setEditing({ ...editing, birth_date: e.target.value })}
                />
              </label>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
                >
                  Salvar
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white"
                >
                  Cancelar
                </button>
                {list.some((c) => c.id === editing.id) ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editing.id)}
                    className="text-sm text-red-400"
                  >
                    Excluir
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

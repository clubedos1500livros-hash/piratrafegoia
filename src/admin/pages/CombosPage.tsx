import { useEffect, useState } from 'react';
import { useTenant } from '@/admin/tenant/TenantContext';
import { getCombos, newComboId, saveCombos } from '@/lib/admin/combosRepo';
import { loadProductsForAdmin } from '@/lib/admin/productsRepo';
import type { AdminCombo } from '@/lib/admin/types';
import type { Product } from '@/types/product';
import { formatBRL } from '@/lib/money';

export function CombosPage() {
  const { restaurantId } = useTenant();
  const [combos, setCombos] = useState<AdminCombo[]>(() => getCombos(restaurantId));
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<AdminCombo | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setCombos(getCombos(restaurantId));
  }, [restaurantId]);

  useEffect(() => {
    let cancelled = false;
    void loadProductsForAdmin(restaurantId).then((list) => {
      if (!cancelled) setProducts(list);
    });
    return () => {
      cancelled = true;
    };
  }, [restaurantId]);

  function persist(next: AdminCombo[]) {
    setCombos(next);
    saveCombos(restaurantId, next);
  }

  function openNew() {
    setEditing({
      id: newComboId(combos),
      restaurant_id: restaurantId,
      name: '',
      description: '',
      product_ids: [],
      price: 0,
      image_url: '',
    });
    setShowForm(true);
  }

  function openEdit(c: AdminCombo) {
    setEditing({ ...c });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  function toggleProduct(id: string) {
    if (!editing) return;
    const set = new Set(editing.product_ids);
    if (set.has(id)) set.delete(id);
    else set.add(id);
    setEditing({ ...editing, product_ids: [...set] });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const combo = { ...editing, restaurant_id: restaurantId };
    const next = combos.some((c) => c.id === combo.id)
      ? combos.map((c) => (c.id === combo.id ? combo : c))
      : [...combos, combo];
    persist(next);
    closeForm();
  }

  function handleDelete(id: string) {
    if (!window.confirm('Excluir combo?')) return;
    persist(combos.filter((c) => c.id !== id));
    closeForm();
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Combos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Monte ofertas com vários produtos e defina o preço do pacote.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover"
        >
          Novo combo
        </button>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {combos.map((c) => (
          <li
            key={c.id}
            className="rounded-2xl bg-panel-2 p-5 ring-1 ring-white/5"
          >
            <p className="font-semibold text-white">{c.name}</p>
            <p className="mt-1 text-sm text-zinc-500">{c.description}</p>
            <p className="mt-2 text-lg font-bold text-accent">{formatBRL(c.price)}</p>
            <p className="mt-2 text-xs text-zinc-500">
              {c.product_ids.length} item(ns) no combo
            </p>
            <button
              type="button"
              onClick={() => openEdit(c)}
              className="mt-3 text-sm text-accent hover:underline"
            >
              Editar
            </button>
          </li>
        ))}
      </ul>

      {showForm && editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-panel-2 p-6 ring-1 ring-white/10">
            <h2 className="text-lg font-semibold text-white">Combo</h2>
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
                <span className="text-zinc-400">Descrição</span>
                <textarea
                  rows={2}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Preço do combo (R$)</span>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  required
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.price || ''}
                  onChange={(e) =>
                    setEditing({ ...editing, price: parseFloat(e.target.value) || 0 })
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Imagem (URL)</span>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.image_url}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                />
              </label>
              <div>
                <p className="text-sm text-zinc-400">Produtos no combo</p>
                <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-midnight p-2">
                  {products.map((p) => (
                    <li key={p.id}>
                      <label className="flex cursor-pointer items-center gap-2 px-2 py-1 text-sm text-zinc-300 hover:bg-white/5">
                        <input
                          type="checkbox"
                          checked={editing.product_ids.includes(p.id)}
                          onChange={() => toggleProduct(p.id)}
                        />
                        {p.name}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
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
                {combos.some((c) => c.id === editing.id) ? (
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

import { useEffect, useRef, useState } from 'react';
import { useTenant } from '@/admin/tenant/TenantContext';
import { deleteProduct, loadProductsForAdmin, newProductId, persistProductsForAdmin } from '@/lib/admin/productsRepo';
import { formatBRL } from '@/lib/money';
import { isValidVideoUrl, normalizeVideoUrl } from '@/lib/video';
import type { Product } from '@/types/product';

const emptyProduct = (restaurantId: string): Product => ({
  id: '',
  restaurant_id: restaurantId,
  category: 'hamburguer',
  name: '',
  description: '',
  price: 0,
  image_url: '',
  video_url: '',
  ingredients: [],
});

export function ProductsAdminPage() {
  const { restaurantId } = useTenant();
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [ingDraft, setIngDraft] = useState('');
  const videoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [videoMode, setVideoMode] = useState<'upload' | 'link'>('upload');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);

  useEffect(() => {
    if (editing) setIngDraft((editing.ingredients ?? []).join('\n'));
  }, [editing]);

  const loadProducts = () => {
    const id = restaurantId || 'default';
    const key = `products_${id}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  useEffect(() => {
    setProducts(loadProducts());
  }, [restaurantId]);

  async function persist(next: Product[]) {
    setProducts(next);
    await persistProductsForAdmin(restaurantId, next);
    const list = await loadProductsForAdmin(restaurantId);
    setProducts(list);
  }

  function openNew() {
    setEditing({
      ...emptyProduct(restaurantId),
      id: newProductId(products),
    });
    setVideoMode('upload');
    setVideoStatus(null);
    setSaveMessage(null);
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditing({ ...p });
    setVideoMode(p.videoType ?? (p.video_url ? 'link' : 'upload'));
    setVideoStatus(null);
    setSaveMessage(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  const handleSave = (product: Product) => {
    try {
      const id = restaurantId || 'default';
      const key = `products_${id}`;
      const existing = localStorage.getItem(key);
      const list = existing ? JSON.parse(existing) : [];
      const updated = [...list, product];
      localStorage.setItem(key, JSON.stringify(updated));
      console.log('SALVO LOCAL:', updated);
      alert('Produto salvo com sucesso');
      window.location.reload();
    } catch (err) {
      console.error('ERRO AO SALVAR:', err);
      alert('Erro ao salvar produto');
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Excluir este produto?')) return;
    setSaving(true);
    setSaveMessage(null);
    try {
      await persist(deleteProduct(id, products));
      setSaveMessage('✅ Produto excluído com sucesso');
      closeForm();
    } catch (err) {
      console.error(err);
      setSaveMessage('❌ Erro ao excluir produto');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Produtos</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Alterações refletem no cardápio público (modo local ou após migrar ao Supabase).
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 hover:bg-accent-hover"
        >
          Cadastrar Produtos
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
        <table className="hidden w-full text-left text-sm lg:table">
          <thead className="bg-panel-2 text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-panel">
            {products.map((p) => (
              <tr key={p.id} className="text-zinc-300">
                <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                <td className="px-4 py-3">{p.category}</td>
                <td className="px-4 py-3 text-accent">{formatBRL(p.price)}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(p)}
                    className="text-sm text-accent hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul className="divide-y divide-white/5 lg:hidden">
          {products.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 bg-panel p-4">
              <div>
                <p className="font-medium text-white">{p.name}</p>
                <p className="text-xs text-zinc-500">{p.category}</p>
                <p className="text-sm text-accent">{formatBRL(p.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => openEdit(p)}
                className="shrink-0 text-sm text-accent"
              >
                Editar
              </button>
            </li>
          ))}
        </ul>
      </div>

      {showForm && editing ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-panel-2 p-6 shadow-xl ring-1 ring-white/10"
            role="dialog"
            aria-modal="true"
          >
            <h2 className="text-lg font-semibold text-white">
              {products.some((p) => p.id === editing.id) ? 'Editar produto' : 'Cadastrar Produtos'}
            </h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editing) handleSave(editing);
              }}
              className="mt-4 space-y-3"
            >
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
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </label>
              <label className="block text-sm">
                <span className="text-zinc-400">Preço (R$)</span>
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
                <span className="text-zinc-400">Categoria</span>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  placeholder="hamburguer, bebidas..."
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="text-zinc-400">Imagem (URL)</span>
                  <input
                    className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                    value={editing.image_url}
                    onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                    placeholder="https://cdn.seusite.com/imagem.jpg"
                  />
                </label>
                <div className="block text-sm">
                  <div className="mb-1 flex gap-3 text-xs text-zinc-400">
                    <button
                      type="button"
                      onClick={() => setVideoMode('upload')}
                      className={`rounded-full px-3 py-1 ${
                        videoMode === 'upload'
                          ? 'bg-accent text-white'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      Upload de vídeo
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoMode('link')}
                      className={`rounded-full px-3 py-1 ${
                        videoMode === 'link'
                          ? 'bg-accent text-white'
                          : 'bg-white/5 text-zinc-300 hover:bg-white/10'
                      }`}
                    >
                      Link de vídeo
                    </button>
                  </div>
                  <label className="block">
                    <span className="text-zinc-400">
                      {videoMode === 'upload' ? 'Vídeo (upload para Storage)' : 'Vídeo (URL externa)'}
                    </span>
                    <input
                      className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                      value={editing.video_url ?? ''}
                      onChange={(e) => setEditing({ ...editing, video_url: e.target.value })}
                      placeholder={
                        videoMode === 'upload'
                          ? 'Preenchido automaticamente após upload'
                          : 'https://res.cloudinary.com/.../video.mp4'
                      }
                      disabled={videoMode === 'upload'}
                    />
                  </label>
                  <input
                    ref={videoFileInputRef}
                    type="file"
                    accept=".mp4,.webm,video/mp4,video/webm"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setVideoStatus('Carregando vídeo...');
                      const run = async () => {
                        try {
                          const mod = await import('@/lib/supabase');
                          const { supabase } = mod;
                          if (!supabase) {
                            console.warn('Supabase não configurado - usando modo link externo');
                            const localUrl = URL.createObjectURL(file);
                            setEditing({
                              ...editing,
                              video_url: localUrl,
                              video: localUrl,
                              videoType: 'upload',
                            });
                            setVideoStatus('✅ Vídeo carregado com sucesso (modo local)');
                            return;
                          }
                          const path = `videos/${Date.now()}-${file.name}`;
                          const { data, error } = await supabase.storage
                            .from('videos')
                            .upload(path, file);
                          if (error || !data?.path) {
                            console.error(error);
                            setVideoStatus('❌ Erro ao subir vídeo');
                            return;
                          }
                          const { data: pub } = supabase.storage.from('videos').getPublicUrl(data.path);
                          const publicUrl = normalizeVideoUrl(pub?.publicUrl ?? null);
                          if (!publicUrl) {
                            setVideoStatus('❌ Não foi possível obter URL pública do vídeo');
                            return;
                          }
                          setEditing({
                            ...editing,
                            video_url: publicUrl,
                            video: publicUrl,
                            videoType: 'upload',
                          });
                          setVideoStatus('✅ Vídeo carregado com sucesso');
                        } catch (err) {
                          console.error(err);
                          setVideoStatus('❌ Erro ao subir vídeo');
                        }
                      };
                      void run();
                    }}
                  />
                  <div className="mt-2 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => videoFileInputRef.current?.click()}
                      className="rounded-xl bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15"
                    >
                      Upload de vídeo
                    </button>
                    <span className="text-xs text-zinc-500">
                      Você pode usar upload (Supabase Storage) ou colar uma URL de CDN (Cloudinary/S3).
                    </span>
                    {editing.video_url ? (
                      <video
                        src={editing.video_url}
                        className="mt-1 h-32 w-full rounded-lg object-cover"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                      />
                    ) : null}
                    {videoStatus ? (
                      <span className="text-xs text-zinc-300">{videoStatus}</span>
                    ) : null}
                  </div>
                </div>
              </div>
              <label className="block text-sm">
                <span className="text-zinc-400">Ingredientes (um por linha)</span>
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-midnight px-3 py-2 text-white"
                  value={ingDraft}
                  onChange={(e) => setIngDraft(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white"
                >
                  Cancelar
                </button>
                {products.some((p) => p.id === editing.id) ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editing.id)}
                    className="rounded-xl px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                  >
                    Excluir
                  </button>
                ) : null}
              </div>
              {saveMessage ? (
                <p className="pt-2 text-xs text-zinc-300">{saveMessage}</p>
              ) : null}
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

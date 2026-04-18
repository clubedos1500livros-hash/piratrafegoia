import { useEffect, useState } from 'react';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
};

function getKey(restaurantId: string) {
  return `products_${restaurantId || 'default'}`;
}

function loadProducts(restaurantId: string): Product[] {
  const data = localStorage.getItem(getKey(restaurantId));
  return data ? JSON.parse(data) : [];
}

function saveProducts(restaurantId: string, products: Product[]) {
  localStorage.setItem(getKey(restaurantId), JSON.stringify(products));
}

export function ProductsAdminPage() {
  const restaurantId = 'default'; // simples por enquanto

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
  });

  useEffect(() => {
    setProducts(loadProducts(restaurantId));
  }, []);

  const handleSave = () => {
    try {
      if (!form.name) {
        alert('Nome obrigatório');
        return;
      }

      const newProduct: Product = {
        ...form,
        id: Date.now().toString(),
      };

      const updated = [...products, newProduct];

      saveProducts(restaurantId, updated);
      setProducts(updated);

      alert('✅ Produto salvo');

      setForm({
        id: '',
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
      });
    } catch (err: any) {
      alert('❌ Erro: ' + (err?.message || err));
      console.error(err);
    }
  };

  const handleDelete = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    saveProducts(restaurantId, updated);
    setProducts(updated);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Produtos</h1>

      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nome"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <br />

        <input
          placeholder="Descrição"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <br />

        <input
          type="number"
          placeholder="Preço"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
        />
        <br />

        <input
          placeholder="Categoria"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
        <br />

        <button onClick={handleSave}>Salvar</button>
      </div>

      <hr />

      <h2>Lista</h2>

      {products.map((p) => (
        <div key={p.id} style={{ marginBottom: 10 }}>
          <b>{p.name}</b> - R$ {p.price}
          <br />
          <button onClick={() => handleDelete(p.id)}>Excluir</button>
        </div>
      ))}
    </div>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminApp } from '@/admin/AdminApp';
import { Layout } from '@/components/Layout';
import { CartProvider } from '@/context/CartContext';
import { ProductsProvider } from '@/context/ProductsContext';
import { HomePage } from '@/pages/HomePage';
import { ProductPage } from '@/pages/ProductPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/*" element={<AdminApp />} />
        <Route
          path="/"
          element={
            <ProductsProvider>
              <CartProvider>
                <Layout />
              </CartProvider>
            </ProductsProvider>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="produto/:id" element={<ProductPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

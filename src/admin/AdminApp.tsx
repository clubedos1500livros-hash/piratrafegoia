import { Navigate, Route, Routes } from 'react-router-dom';
import { TenantPortalPage } from '@/admin/pages/TenantPortalPage';
import { TenantRouteLayout } from '@/admin/TenantRouteLayout';

export function AdminApp() {
  return (
    <Routes>
      <Route index element={<TenantPortalPage />} />
      <Route path=":restaurantId/*" element={<TenantRouteLayout />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

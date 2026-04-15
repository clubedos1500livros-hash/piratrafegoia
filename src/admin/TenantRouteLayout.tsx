import { useEffect } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { AdminLayout } from '@/admin/AdminLayout';
import { adminModules } from '@/admin/modules/registry';
import { seedTenantIfNeeded } from '@/lib/admin/seed';
import { migrateLegacyStorageToTenant } from '@/lib/tenant/migrateLegacy';
import { isSupabaseConfigured } from '@/lib/supabase';
import { seedRemoteRestaurant } from '@/lib/supabase/seedRemote';
import { sanitizeRestaurantId, setPublicRestaurantId } from '@/lib/tenant/publicTenant';
import { TenantProvider, useTenant } from '@/admin/tenant/TenantContext';

function TenantLifecycle() {
  const { restaurantId } = useTenant();

  useEffect(() => {
    // Keep public menu pinned to the tenant being managed in this browser.
    setPublicRestaurantId(restaurantId);
    migrateLegacyStorageToTenant(restaurantId);
    if (isSupabaseConfigured()) {
      void seedRemoteRestaurant(restaurantId);
    } else {
      seedTenantIfNeeded(restaurantId);
    }
  }, [restaurantId]);

  return null;
}

export function TenantRouteLayout() {
  const { restaurantId: raw } = useParams<{ restaurantId: string }>();
  const restaurantId = raw ? sanitizeRestaurantId(raw) : null;

  if (!restaurantId) {
    return <Navigate to="/admin" replace />;
  }

  

  return (
    <TenantProvider restaurantId={restaurantId}>
      <TenantLifecycle />
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          {adminModules.map((m) => (
            <Route key={m.id} path={m.path} element={<m.Component />} />
          ))}
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      </Routes>
    </TenantProvider>
  );
}

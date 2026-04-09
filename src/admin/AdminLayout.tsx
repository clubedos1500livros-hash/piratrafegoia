import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/admin/components/AdminSidebar';
import { useTenant } from '@/admin/tenant/TenantContext';

export function AdminLayout() {
  const { displayName, restaurantId } = useTenant();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-midnight text-zinc-100">
      <div className="flex min-h-dvh">
        <aside className="hidden w-60 shrink-0 border-r border-white/10 bg-panel lg:block">
          <div className="border-b border-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent">Tenant</p>
            <p className="truncate text-lg font-bold text-white" title={restaurantId}>
              {displayName}
            </p>
            <p className="truncate text-xs text-zinc-500">{restaurantId}</p>
          </div>
          <AdminSidebar />
          <div className="space-y-2 p-4">
            <NavLink
              to="/admin"
              className="block rounded-xl bg-midnight px-4 py-3 text-center text-sm text-zinc-400 ring-1 ring-white/10 hover:text-accent"
            >
              Trocar cliente
            </NavLink>
            <NavLink
              to="/"
              className="block rounded-xl bg-panel-2 px-4 py-3 text-center text-sm text-zinc-300 ring-1 ring-white/10 hover:text-accent"
            >
              Ver cardápio público
            </NavLink>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-white/10 bg-midnight/95 px-4 py-3 backdrop-blur lg:hidden">
            <button
              type="button"
              className="rounded-lg p-2 text-zinc-300 hover:bg-white/10"
              aria-label="Abrir menu"
              onClick={() => setMenuOpen(true)}
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <span className="truncate font-semibold text-white">{displayName}</span>
            <NavLink to="/admin" className="text-xs text-accent">
              Clientes
            </NavLink>
          </header>

          {menuOpen ? (
            <div className="fixed inset-0 z-40 lg:hidden">
              <button
                type="button"
                className="absolute inset-0 bg-black/70"
                aria-label="Fechar"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute left-0 top-0 flex h-full w-[min(100%,280px)] flex-col bg-panel shadow-xl">
                <div className="flex items-center justify-between border-b border-white/10 p-4">
                  <span className="font-bold text-white">Menu</span>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg p-2 text-zinc-400 hover:bg-white/10"
                    aria-label="Fechar menu"
                  >
                    ✕
                  </button>
                </div>
                <AdminSidebar onNavigate={() => setMenuOpen(false)} />
              </div>
            </div>
          ) : null}

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

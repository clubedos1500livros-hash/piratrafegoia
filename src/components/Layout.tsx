import { Link, Outlet, useLocation } from 'react-router-dom';
import { CartDrawer } from '@/components/CartDrawer';
import { HeaderLogo3D } from '@/components/HeaderLogo3D';
import { useCart } from '@/context/CartContext';
export function Layout() {
  const { setOpen, lineCount } = useCart();
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  return (
    <div className="flex min-h-dvh flex-col">

      {!isHome && (
        <header className="sticky top-0 z-30 border-b border-white/5 bg-midnight/90 backdrop-blur-md">
          <div className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 px-4 py-2 sm:gap-4 sm:px-6 sm:py-3">
            <Link to="/" className="flex min-w-0 items-center gap-3 justify-self-start">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white sm:text-base">
                  Cardápio <span className="text-accent">Digital</span>
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 justify-center justify-self-center px-1">
              <HeaderLogo3D />
            </div>

            <div className="flex shrink-0 items-center justify-end gap-2 justify-self-end">
              <Link
                to="/admin"
                className="hidden rounded-lg px-2 py-2 text-xs font-medium text-zinc-500 hover:text-accent sm:block"
              >
                Gestão
              </Link>

              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-panel-2 ring-1 ring-white/10 transition hover:ring-accent/40"
                aria-label={`Abrir carrinho${lineCount ? `, ${lineCount} itens` : ''}`}
              >
                <svg className="h-6 w-6 text-zinc-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>

                {lineCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {lineCount > 99 ? '99+' : lineCount}
                  </span>
                ) : null}

              </button>
            </div>

          </div>
        </header>
      )}

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-2 sm:px-6 sm:py-4">
        <Outlet />
      </main>

      <CartDrawer />
    </div>
  );
}


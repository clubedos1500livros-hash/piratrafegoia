import { NavLink } from 'react-router-dom';
import { adminModules } from '@/admin/modules/registry';
import { useTenant } from '@/admin/tenant/TenantContext';

type Props = {
  onNavigate?: () => void;
};

export function AdminSidebar({ onNavigate }: Props) {
  const { restaurantId } = useTenant();
  const base = `/admin/${restaurantId}`;

  return (
    <nav className="flex flex-col gap-1 p-4">
      {adminModules.map((m) => (
        <NavLink
          key={m.id}
          to={`${base}/${m.path}`}
          onClick={onNavigate}
          className={({ isActive }) =>
            `rounded-xl px-4 py-3 text-sm font-medium transition ${
              isActive
                ? 'bg-accent text-white shadow-md shadow-accent/20'
                : 'text-zinc-400 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          {m.label}
        </NavLink>
      ))}
    </nav>
  );
}

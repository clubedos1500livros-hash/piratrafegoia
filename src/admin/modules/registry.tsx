import { BirthdaysPage } from '@/admin/pages/BirthdaysPage';
import { CompanySettingsPage } from '@/admin/pages/CompanySettingsPage';
import { CombosPage } from '@/admin/pages/CombosPage';
import { CustomersPage } from '@/admin/pages/CustomersPage';
import { DashboardPage } from '@/admin/pages/DashboardPage';
import { FinancePage } from '@/admin/pages/FinancePage';
import { OrdersPage } from '@/admin/pages/OrdersPage';
import { ProductsAdminPage } from '@/admin/pages/ProductsAdminPage';
import { WhatsAppAdminPage } from '@/admin/pages/WhatsAppAdminPage';
import type { ComponentType } from 'react';

export type AdminModuleDefinition = {
  id: string;
  /** Segmento de URL relativo ao tenant (ex.: dashboard) */
  path: string;
  label: string;
  Component: ComponentType;
};

/**
 * Registro central de módulos do painel — adicione rotas aqui para escalar o SaaS.
 * Próximos passos: lazy `React.lazy`, `requiredPlan?: ('free'|'pro')[]`, feature flags por tenant.
 */
export const adminModules: AdminModuleDefinition[] = [
  { id: 'dashboard', path: 'dashboard', label: 'Visão geral', Component: DashboardPage },
  { id: 'company', path: 'company', label: 'Dados iniciais', Component: CompanySettingsPage },
  { id: 'products', path: 'products', label: 'Produtos', Component: ProductsAdminPage },
  { id: 'combos', path: 'combos', label: 'Combos', Component: CombosPage },
  { id: 'orders', path: 'orders', label: 'Pedidos', Component: OrdersPage },
  { id: 'customers', path: 'customers', label: 'Clientes', Component: CustomersPage },
  { id: 'birthdays', path: 'birthdays', label: 'Aniversários', Component: BirthdaysPage },
  { id: 'whatsapp', path: 'whatsapp', label: 'WhatsApp', Component: WhatsAppAdminPage },
  { id: 'finance', path: 'finance', label: 'Financeiro', Component: FinancePage },
];

export const adminModulePathSet = new Set(adminModules.map((m) => m.path));

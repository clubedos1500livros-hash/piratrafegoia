/** Hub único para eventos do admin; filtre por restaurantId + scope. */
export const ADMIN_HUB = 'cardapio-admin-hub';

export type AdminHubScope =
  | 'company'
  | 'products'
  | 'combos'
  | 'orders'
  | 'customers'
  | 'whatsapp';

export type AdminHubDetail = {
  restaurantId: string;
  scope: AdminHubScope;
};

export function emitAdminHub(restaurantId: string, scope: AdminHubScope): void {
  window.dispatchEvent(
    new CustomEvent<AdminHubDetail>(ADMIN_HUB, { detail: { restaurantId, scope } }),
  );
}

export function subscribeAdminHub(
  restaurantId: string,
  scope: AdminHubScope,
  handler: () => void,
): () => void {
  const fn = (e: Event) => {
    const d = (e as CustomEvent<AdminHubDetail>).detail;
    if (d?.restaurantId === restaurantId && d?.scope === scope) handler();
  };
  window.addEventListener(ADMIN_HUB, fn);
  return () => window.removeEventListener(ADMIN_HUB, fn);
}

export function subscribePublicProducts(restaurantId: string, handler: () => void): () => void {
  return subscribeAdminHub(restaurantId, 'products', handler);
}

export function subscribePublicCompany(restaurantId: string, handler: () => void): () => void {
  return subscribeAdminHub(restaurantId, 'company', handler);
}

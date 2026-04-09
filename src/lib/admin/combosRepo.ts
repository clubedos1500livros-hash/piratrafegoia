import { scopeCombos } from '@/lib/restaurant/scope';
import { saveJson } from '@/lib/admin/jsonStorage';
import { emitAdminHub } from '@/lib/tenant/events';
import { buildTenantStorageKeys } from '@/lib/tenant/storageKeys';
import type { AdminCombo } from '@/lib/admin/types';

export function getCombos(restaurantId: string): AdminCombo[] {
  const k = buildTenantStorageKeys(restaurantId);
  const raw = loadJson<AdminCombo[]>(k.combos, []);
  return scopeCombos(raw, k.restaurantId);
}

export function saveCombos(restaurantId: string, combos: AdminCombo[]): void {
  const k = buildTenantStorageKeys(restaurantId);
  saveJson(k.combos, scopeCombos(combos, k.restaurantId));
  emitAdminHub(k.restaurantId, 'combos');
}

export function newComboId(list: AdminCombo[]): string {
  const nums = list.map((c) => parseInt(c.id, 10)).filter((n) => !Number.isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1);
}

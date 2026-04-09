export type TenantRecord = {
  id: string;
  name: string;
  created_at: string;
};

export type TenantRegistryFile = {
  tenants: TenantRecord[];
};

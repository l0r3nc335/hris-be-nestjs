export const activeWhere = { deletedAt: null } as const;

export const trashedWhere = { deletedAt: { not: null } } as const;

export function tenantActiveWhere(tenantId: string) {
  return { tenantId, ...activeWhere };
}

export function tenantTrashedWhere(tenantId: string) {
  return { tenantId, ...trashedWhere };
}

export function resolveListStatus(
  status: string,
  deletedAt: Date | null | undefined,
): string {
  if (deletedAt) return 'deleted';
  return status;
}

export const softDeleteData = () => ({ deletedAt: new Date() });

export const restoreData = () => ({ deletedAt: null });

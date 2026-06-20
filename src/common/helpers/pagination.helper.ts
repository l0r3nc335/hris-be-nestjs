import { PaginationQueryDto } from '../dto/pagination-query.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

export function normalizePagination(query: PaginationQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}

export function buildStatusFilter(status?: string): Record<string, unknown> {
  if (!status || status === 'all') return {};
  return { status };
}

export function buildSearchWhere(
  q: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  if (!q?.trim()) return undefined;
  const term = q.trim();
  return {
    OR: fields.map((field) => ({
      [field]: { contains: term, mode: 'insensitive' as const },
    })),
  };
}

interface PaginateModel<TRecord> {
  findMany: (args: {
    where: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    skip: number;
    take: number;
  }) => Promise<TRecord[]>;
  count: (args: { where: Record<string, unknown> }) => Promise<number>;
}

export async function paginate<TRecord, TDto>(
  model: PaginateModel<TRecord>,
  options: {
    where: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    mapFn: (record: TRecord) => TDto;
    query: PaginationQueryDto;
    searchFields?: string[];
    resolveStatusFilter?: (status?: string) => Record<string, unknown>;
    findManyExtras?: Record<string, unknown>;
  },
): Promise<PaginatedResponseDto<TDto>> {
  const { page, limit, skip, take } = normalizePagination(options.query);
  const statusFilter = options.resolveStatusFilter
    ? options.resolveStatusFilter(options.query.status)
    : buildStatusFilter(options.query.status);
  const searchWhere = buildSearchWhere(
    options.query.q,
    options.searchFields ?? ['name'],
  );

  const where: Record<string, unknown> = {
    ...options.where,
    ...statusFilter,
    ...(searchWhere ?? {}),
  };

  const [records, total] = await Promise.all([
    model.findMany({
      where,
      orderBy: options.orderBy ?? { createdAt: 'desc' },
      skip,
      take,
      ...(options.findManyExtras ?? {}),
    }),
    model.count({ where }),
  ]);

  return {
    data: records.map(options.mapFn),
    meta: { page, limit, total },
  };
}

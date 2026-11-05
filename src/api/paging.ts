// Shared helpers for reading LARGE result sets from Supabase/PostgREST.
//
// PostgREST caps every select at 1000 rows (the project's max-rows), silently
// truncating anything beyond — so a ~9,000-bottle imported cellar was read as
// 1000 rows (wrong counts, partial deletes). And a long `.in('col', ids)` list
// goes into the URL, which overflows on big id sets. These helpers page through
// a query with `.range()` and split `.in()` lists into chunks.

export const PAGE_SIZE = 1000;
export const IN_CHUNK = 300;

type PageResult<T> = { data: T[] | null; error: unknown };

// Read EVERY row of a query, page by page. `build(from, to)` must return the
// query with `.range(from, to)` applied — and the query should carry a stable
// `.order(...)` (e.g. by 'id') so pages don't overlap or skip rows.
export async function selectAllPages<T = any>(
  build: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize = PAGE_SIZE,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await build(from, from + pageSize - 1);
    if (error) throw error;
    const rows = (data ?? []) as T[];
    out.push(...rows);
    if (rows.length < pageSize) break;
  }
  return out;
}

// Split a list into chunks (deduped, falsy entries dropped) for `.in()` filters.
export function chunkIds(ids: (string | null | undefined)[], size = IN_CHUNK): string[][] {
  const clean = Array.from(new Set(ids.filter(Boolean) as string[]));
  const out: string[][] = [];
  for (let i = 0; i < clean.length; i += size) out.push(clean.slice(i, i + size));
  return out;
}

// Run a paged select once per `.in()` chunk and concatenate everything.
// `build(chunk, from, to)` must apply `.in(col, chunk)` and `.range(from, to)`.
export async function selectAllInChunks<T = any>(
  ids: (string | null | undefined)[],
  build: (chunk: string[], from: number, to: number) => PromiseLike<PageResult<T>>,
  chunkSize = IN_CHUNK,
): Promise<T[]> {
  const out: T[] = [];
  for (const chunk of chunkIds(ids, chunkSize)) {
    out.push(...(await selectAllPages<T>((from, to) => build(chunk, from, to))));
  }
  return out;
}

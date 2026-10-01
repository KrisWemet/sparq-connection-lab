// schema-fallback.ts — lets new code ship before its additive migration runs.
// When a query fails because a new column/table/value doesn't exist yet, the
// caller retries with the pre-migration shape instead of failing the user.

type PgError = { code?: string; message?: string } | null | undefined;

/** Missing column or table (PostgREST schema cache or Postgres itself). */
export function isMissingSchemaError(error: PgError): boolean {
  if (!error) return false;
  if (error.code === 'PGRST204' || error.code === 'PGRST205' || error.code === '42703' || error.code === '42P01') return true;
  return /column .* does not exist|could not find the .* column|relation .* does not exist|could not find the table/i.test(error.message || '');
}

/** A CHECK constraint rejected a value that a newer migration allows. */
export function isCheckViolation(error: PgError): boolean {
  return error?.code === '23514';
}

/**
 * Runs `full`; if it fails only because the schema is older, runs `fallback`.
 * Both must return a Supabase-style `{ data, error }`.
 */
export async function withSchemaFallback<T>(
  full: () => PromiseLike<{ data: T | null; error: PgError }>,
  fallback: () => PromiseLike<{ data: T | null; error: PgError }>,
): Promise<{ data: T | null; error: PgError }> {
  const first = await full();
  if (first.error && (isMissingSchemaError(first.error) || isCheckViolation(first.error))) {
    return fallback();
  }
  return first;
}

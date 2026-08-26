export function createMany<T>(count: number, factory: () => Promise<T>): Promise<T[]> {
  return Promise.all(Array.from({ length: count }, factory));
}

/**
 * Creates `count` items via `factory`, running at most `concurrency` factories at once.
 * Keeps setup fast without overwhelming the backend with a large parallel burst,
 * which is important when many test shards hit the API simultaneously.
 */
export async function createManyLimited<T>(
  count: number,
  factory: (index: number) => Promise<T>,
  concurrency: number = 5,
): Promise<T[]> {
  const results: T[] = new Array<T>(count);
  let nextIndex: number = 0;

  const worker = async (): Promise<void> => {
    while (nextIndex < count) {
      const index: number = nextIndex++;
      results[index] = await factory(index);
    }
  };

  const pool: Promise<void>[] = Array.from({ length: Math.min(concurrency, count) }, worker);
  await Promise.all(pool);
  return results;
}

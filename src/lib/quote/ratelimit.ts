/**
 * Rate limiting and duplicate protection backed by a shared store
 * (Upstash Redis REST). An in-memory map is NOT a global limiter on
 * serverless platforms, so production requires the shared store.
 */
export interface Guard {
  /** Returns false when the caller exceeded the window. */
  allow(key: string, limit: number, windowSeconds: number): Promise<boolean>;
  /** Returns false when the id was already used. */
  claimOnce(id: string, ttlSeconds: number): Promise<boolean>;
}

export function upstashGuard(url: string, token: string, fetchImpl: typeof fetch = fetch): Guard {
  async function pipeline(commands: (string | number)[][]): Promise<unknown[]> {
    const res = await fetchImpl(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`rate-limit store HTTP ${res.status}`);
    const data = (await res.json()) as { result?: unknown; error?: string }[];
    return data.map((d) => {
      if (d.error) throw new Error(d.error);
      return d.result;
    });
  }
  return {
    async allow(key, limit, windowSeconds) {
      const [count] = await pipeline([
        ['INCR', key],
        ['EXPIRE', key, windowSeconds, 'NX'],
      ]);
      return Number(count) <= limit;
    },
    async claimOnce(id, ttlSeconds) {
      const [result] = await pipeline([['SET', `dal:upit:${id}`, '1', 'NX', 'EX', ttlSeconds]]);
      return result === 'OK';
    },
  };
}

/** Single-process guard for tests and the local test transport only. */
export function memoryGuard(): Guard {
  const counts = new Map<string, { n: number; until: number }>();
  const used = new Set<string>();
  return {
    async allow(key, limit, windowSeconds) {
      const now = Date.now();
      const e = counts.get(key);
      if (!e || e.until < now) {
        counts.set(key, { n: 1, until: now + windowSeconds * 1000 });
        return true;
      }
      e.n += 1;
      return e.n <= limit;
    },
    async claimOnce(id) {
      if (used.has(id)) return false;
      used.add(id);
      return true;
    },
  };
}

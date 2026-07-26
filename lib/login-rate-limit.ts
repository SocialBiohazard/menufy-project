import "server-only";

type AttemptWindow = {
  count: number;
  windowStartedAt: number;
  blockedUntil: number;
};

const attempts = new Map<string, AttemptWindow>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 6;

export function isLoginBlocked(key: string, now = Date.now()) {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (entry.blockedUntil > now) return true;
  if (now - entry.windowStartedAt >= WINDOW_MS) attempts.delete(key);
  return false;
}

export function recordLoginFailure(key: string, now = Date.now()) {
  const current = attempts.get(key);
  const entry =
    !current || now - current.windowStartedAt >= WINDOW_MS
      ? { count: 0, windowStartedAt: now, blockedUntil: 0 }
      : current;
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) entry.blockedUntil = now + WINDOW_MS;
  attempts.set(key, entry);
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}

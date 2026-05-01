export function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function safeParseJson<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function readStore<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  const parsed = safeParseJson<T>(localStorage.getItem(key));
  return parsed ?? fallback;
}

export function writeStore<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStore(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function minutesDiff(aIso: string, bIso: string): number {
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.max(0, (b - a) / 60000);
}

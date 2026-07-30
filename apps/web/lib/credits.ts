const CREDITS_KEY = "co_patner_credits";
const DEFAULT_CREDITS = 100000;

export const RATE_AUDIO = 49;
export const RATE_VIDEO = 69;

export function getCredits(): number {
  if (typeof window === "undefined") return DEFAULT_CREDITS;
  const stored = localStorage.getItem(CREDITS_KEY);
  if (stored === null) {
    localStorage.setItem(CREDITS_KEY, String(DEFAULT_CREDITS));
    return DEFAULT_CREDITS;
  }
  return parseInt(stored, 10) || 0;
}

export function deductCredits(amount: number): boolean {
  const current = getCredits();
  if (current < amount) return false;
  localStorage.setItem(CREDITS_KEY, String(current - amount));
  return true;
}

export function hasEnoughCredits(amount: number): boolean {
  return getCredits() >= amount;
}

export function addCredits(amount: number): void {
  const current = getCredits();
  localStorage.setItem(CREDITS_KEY, String(current + amount));
}

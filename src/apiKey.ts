// The user's own Anthropic key, kept only in this browser's localStorage.
const STORAGE_KEY = 'pema.anthropicKey';

// Anthropic keys start "sk-ant-"; this only catches obvious paste mistakes
export function looksLikeAnthropicKey(value: string): boolean {
  return /^sk-ant-[A-Za-z0-9_-]{20,}$/.test(value.trim());
}

// Shows only the end of the key so it can be recognised without being revealed
export function maskKey(key: string): string {
  return `sk-ant-…${key.slice(-4)}`;
}

export function getApiKey(): string | null {
  try {
    return globalThis.localStorage?.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function saveApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

export function removeApiKey(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// Imported first by tests that load the persisted store (directly or through
// a module such as signal-source-i18n): zustand/persist needs a storage.
const memory = new Map<string, string>();
const storage: Storage = {
  get length() { return memory.size; },
  clear: () => memory.clear(),
  getItem: (key) => memory.get(key) ?? null,
  key: (index) => [...memory.keys()][index] ?? null,
  removeItem: (key) => { memory.delete(key); },
  setItem: (key, value) => { memory.set(key, value); },
};
if (!('localStorage' in globalThis)) Object.defineProperty(globalThis, 'localStorage', { value: storage, configurable: true });

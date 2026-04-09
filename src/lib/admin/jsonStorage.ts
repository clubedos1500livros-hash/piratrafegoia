function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadJson<T>(key: string, fallback: T): T {
  return read(key, fallback);
}

export function saveJson<T>(key: string, value: T): void {
  write(key, value);
}

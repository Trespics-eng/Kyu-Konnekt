import { useEffect, useState } from 'react';

export function readStore<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(`kyu:${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(`kyu:${key}`, JSON.stringify(value));
  } catch {
    // Keep the current session usable even if storage is unavailable or full.
  }
}

export function useLocalStorageState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readStore(key, fallback));
  useEffect(() => writeStore(key, value), [key, value]);
  return [value, setValue] as const;
}

export function readImagePreview(file: File, maxBytes = 2_000_000): Promise<string> {
  if (!file.type.startsWith('image/')) return Promise.reject(new Error('Choose an image file.'));
  if (file.size > maxBytes) return Promise.reject(new Error('Choose an image smaller than 2 MB.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read this image.'));
    reader.onerror = () => reject(new Error('Could not read this image.'));
    reader.readAsDataURL(file);
  });
}

export function readMediaPreview(file: File, maxBytes = 2_000_000): Promise<string> {
  if (!file.type.startsWith('image/') && !['video/mp4', 'video/webm'].includes(file.type)) return Promise.reject(new Error('Choose an image, MP4 or WebM video.'));
  if (file.size > maxBytes) return Promise.reject(new Error('Choose a media file smaller than 2 MB.'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Could not read this media file.'));
    reader.onerror = () => reject(new Error('Could not read this media file.'));
    reader.readAsDataURL(file);
  });
}

export function shortDate() {
  return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium' }).format(new Date());
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const money = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    value / 100,
  );
export const date = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
export function safeNext(value: string | null) {
  return value && /^\/(?!\/)/.test(value) && !value.includes('\\')
    ? value
    : '/conta';
}
export function csvCell(value: unknown) {
  const text = String(value ?? '');
  return (
    '"' +
    (/^[=+@\-\t\r]/.test(text) ? "'" : '') +
    text.replaceAll('"', '""') +
    '"'
  );
}

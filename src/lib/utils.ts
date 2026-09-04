import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data no formato 'yyyy-MM-dd' (vinda do banco) para 'dd/MM/yyyy'
 * sem passar por new Date(), evitando o deslocamento de um dia por fuso horário.
 */
export function formatDateKeyBR(dateKey?: string | null) {
  if (!dateKey) return '—';
  const [y, m, d] = dateKey.split('T')[0].split('-');
  if (!y || !m || !d) return dateKey;
  return `${d}/${m}/${y}`;
}

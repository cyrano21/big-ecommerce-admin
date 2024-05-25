import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
})

export const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

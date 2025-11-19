import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn merges tailwind utility strings while trimming falsy values.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


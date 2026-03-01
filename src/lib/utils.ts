/**
 * Shadcn UI Utility — `cn()`
 *
 * Merges Tailwind CSS classes with proper precedence.
 * Used across all React components for conditional class composition.
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

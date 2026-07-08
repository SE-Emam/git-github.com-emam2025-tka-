import * as React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a currency amount in EGP
 */
export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
}

/**
 * Formats a date to a readable string
 */
export function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency with professional comma separators
 * @param amount - The amount to format
 * @param currency - Currency symbol (default: '₹')
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string with commas
 */
export function formatCurrency(
  amount: number | string, 
  currency: string = '₹', 
  decimals: number = 2
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) return currency === 'INR' ? 'INR 0.00' : `${currency}0.00`
  
  const formattedAmount = numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
  
  // Add space after INR
  if (currency === 'INR') {
    return `INR ${formattedAmount}`
  }
  
  return `${currency}${formattedAmount}`
}

/**
 * Format number with comma separators (no currency symbol)
 * @param amount - The amount to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted number string with commas
 */
export function formatNumber(
  amount: number | string, 
  decimals: number = 2
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) return '0.00'
  
  return numAmount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price in Indian Rupees
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const then = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000)

  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  return formatDate(date)
}

// Calculate GST breakdown (18% GST in India for most goods)
export function calculateGST(amount: number, isInterState = false): {
  cgst: number
  sgst: number
  igst: number
  totalGst: number
  taxableAmount: number
} {
  const gstRate = 0.18
  const gstAmount = Math.round(amount * gstRate)
  
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: gstAmount,
      totalGst: gstAmount,
      taxableAmount: amount,
    }
  }
  
  const halfGst = Math.round(gstAmount / 2)
  return {
    cgst: halfGst,
    sgst: halfGst,
    igst: 0,
    totalGst: gstAmount,
    taxableAmount: amount,
  }
}

// Validate Indian PIN code
export function validatePincode(pincode: string): boolean {
  return /^[1-9][0-9]{5}$/.test(pincode)
}

// Validate Indian phone number
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return /^[6-9]\d{9}$/.test(cleaned)
}

// Validate email
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Generate order number
export function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `ORD-${year}-${random}`
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Sleep function for demo purposes
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

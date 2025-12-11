/**
 * Date formatting and manipulation utilities
 */

/**
 * Format a date string to a readable format
 * @param date - ISO date string or Date object
 * @param locale - Locale for formatting (default: 'id-ID')
 */
export function formatDate(
  date: string | Date,
  locale: string = 'id-ID',
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} hari yang lalu`
  if (hours > 0) return `${hours} jam yang lalu`
  if (minutes > 0) return `${minutes} menit yang lalu`
  return 'Baru saja'
}

/**
 * Check if a date is in the past
 */
export function isPast(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getTime() < Date.now()
}

/**
 * Check if a date is in the future
 */
export function isFuture(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.getTime() > Date.now()
}

/**
 * Format date to dd-mm-yyyy HH:mm format
 */
export function formatDateTime(date: string | Date | number): string {
  let dateObj: Date

  if (typeof date === 'number') {
    // If it's a Unix timestamp in seconds, convert to milliseconds
    dateObj = new Date(date * 1000)
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }

  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = dateObj.getFullYear()
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')

  return `${day}-${month}-${year} ${hours}:${minutes}`
}

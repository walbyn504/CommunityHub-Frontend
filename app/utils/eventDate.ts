/** Interpreta la fecha y hora del evento en la zona local del navegador. */
export function eventDateTime(date: string, time: string): Date {
  const datePart = date.slice(0, 10)
  const timePart = /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : '23:59'
  return new Date(`${datePart}T${timePart}:00`)
}

export function hasEventPassed(date: string, time: string): boolean {
  const value = eventDateTime(date, time)
  return !Number.isNaN(value.getTime()) && value.getTime() < Date.now()
}

export function isEventDateBeforeToday(date: string): boolean {
  const value = eventDateTime(date, '00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return !Number.isNaN(value.getTime()) && value.getTime() < today.getTime()
}

export function formatEventDate(date: string, format: 'short' | 'long' = 'short'): string {
  const value = eventDateTime(date, '00:00')
  if (Number.isNaN(value.getTime())) return ''

  return value.toLocaleDateString('es-ES', format === 'long'
    ? { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
    : { day: '2-digit', month: 'short', year: 'numeric' })
}

const EVENT_TIME_ZONE = 'America/Costa_Rica'
const EVENT_TIMEZONE_OFFSET = '-06:00'

/** Interpreta la fecha y hora del evento en la zona horaria de Costa Rica. */
export function eventDateTime(date: string, time: string): Date {
  const datePart = date.slice(0, 10)
  const timePart = /^\d{2}:\d{2}/.test(time) ? time.slice(0, 5) : '23:59'
  return new Date(`${datePart}T${timePart}:00${EVENT_TIMEZONE_OFFSET}`)
}

export function hasEventPassed(date: string, time: string): boolean {
  const value = eventDateTime(date, time)
  return !Number.isNaN(value.getTime()) && value.getTime() < Date.now()
}

export function isEventDateBeforeToday(date: string): boolean {
  const datePart = date.slice(0, 10)
  const todayParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: EVENT_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date())
  const values = Object.fromEntries(todayParts.map(({ type, value }) => [type, value]))
  const today = `${values.year}-${values.month}-${values.day}`
  return /^\d{4}-\d{2}-\d{2}$/.test(datePart) && datePart < today
}

export function formatEventDate(date: string, format: 'short' | 'long' = 'short'): string {
  const value = eventDateTime(date, '00:00')
  if (Number.isNaN(value.getTime())) return ''

  return value.toLocaleDateString('es-CR', format === 'long'
    ? { timeZone: EVENT_TIME_ZONE, weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
    : { timeZone: EVENT_TIME_ZONE, day: '2-digit', month: 'short', year: 'numeric' })
}

/**
 * Polish date formatting utilities.
 *
 * All functions accept either a Date object or an ISO-8601 string.
 */

const MONTHS_PL = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
] as const;

function toDate(date: string | Date): Date {
  return typeof date === 'string' ? new Date(date) : date;
}

/**
 * Format a date as Polish long-form: "1 stycznia 2024".
 */
export function formatDatePL(date: string | Date): string {
  const d = toDate(date);
  const day = d.getDate();
  const month = MONTHS_PL[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

/**
 * Format a date-time as "1 stycznia 2024, 14:30".
 */
export function formatDateTimePL(date: string | Date): string {
  const d = toDate(date);
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${formatDatePL(d)}, ${hours}:${minutes}`;
}

/**
 * Format a date as a relative Polish string, e.g. "2 godziny temu".
 *
 * Covers: seconds, minutes, hours, days, weeks, months, years.
 */
export function formatRelativePL(date: string | Date): string {
  const d = toDate(date);
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 0) {
    return 'w przyszłości';
  }
  if (diffSec < 5) {
    return 'właśnie teraz';
  }
  if (diffSec < 60) {
    return `${diffSec} ${pluralPL(diffSec, 'sekundę', 'sekundy', 'sekund')} temu`;
  }

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `${diffMin} ${pluralPL(diffMin, 'minutę', 'minuty', 'minut')} temu`;
  }

  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) {
    return `${diffHour} ${pluralPL(diffHour, 'godzinę', 'godziny', 'godzin')} temu`;
  }

  const diffDay = Math.floor(diffHour / 24);
  if (diffDay === 1) {
    return 'wczoraj';
  }
  if (diffDay < 7) {
    return `${diffDay} ${pluralPL(diffDay, 'dzień', 'dni', 'dni')} temu`;
  }

  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) {
    return `${diffWeek} ${pluralPL(diffWeek, 'tydzień', 'tygodnie', 'tygodni')} temu`;
  }

  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) {
    return `${diffMonth} ${pluralPL(diffMonth, 'miesiąc', 'miesiące', 'miesięcy')} temu`;
  }

  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear} ${pluralPL(diffYear, 'rok', 'lata', 'lat')} temu`;
}

/**
 * Polish pluralization helper.
 *
 * Rules:
 *  - 1           -> singular  (e.g. "1 minuta")
 *  - 2-4         -> few       (e.g. "3 minuty")
 *  - 5-21        -> many      (e.g. "5 minut")
 *  - for n > 21  -> check last digit (2-4 -> few, else many)
 */
function pluralPL(n: number, one: string, few: string, many: string): string {
  if (n === 1) return one;

  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;

  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return many;
  if (lastDigit >= 2 && lastDigit <= 4) return few;

  return many;
}

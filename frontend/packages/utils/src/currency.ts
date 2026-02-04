/**
 * PLN (Polish Zloty) currency formatting utilities.
 *
 * Internally all monetary values are stored as **grosze** (1/100 PLN)
 * to avoid floating-point rounding issues.
 */

/**
 * Format a grosze amount to a human-readable PLN string.
 *
 * @example
 * formatPLN(123456) // "1 234,56 zł"
 * formatPLN(0)      // "0,00 zł"
 * formatPLN(-500)   // "-5,00 zł"
 *
 * @param grosze - amount in grosze (1/100 PLN)
 * @returns formatted string with Polish thousands separator (space),
 *          comma decimal separator, and "zł" suffix
 */
export function formatPLN(grosze: number): string {
  const negative = grosze < 0;
  const abs = Math.abs(grosze);

  const zloty = Math.floor(abs / 100);
  const gr = abs % 100;

  // Add thousands separator (space)
  const zlotySeparated = zloty
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0'); // non-breaking space

  const grStr = gr.toString().padStart(2, '0');

  return `${negative ? '-' : ''}${zlotySeparated},${grStr} z\u0142`;
}

/**
 * Parse a PLN-formatted string back to grosze.
 *
 * Handles both "1 234,56 zł" and plain numeric strings.
 *
 * @param text - human-readable PLN string
 * @returns amount in grosze, or `NaN` if the string cannot be parsed
 */
export function parsePLN(text: string): number {
  // Strip currency symbol, whitespace variants, and trim
  let cleaned = text
    .replace(/z[łl]/gi, '')
    .replace(/\s/g, '')
    .trim();

  // Replace comma decimal separator with dot
  cleaned = cleaned.replace(',', '.');

  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) {
    return NaN;
  }

  // Round to avoid floating-point issues and convert to grosze
  return Math.round(parsed * 100);
}

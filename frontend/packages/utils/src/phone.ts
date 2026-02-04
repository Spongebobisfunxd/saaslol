/**
 * Polish phone-number validation and formatting utilities.
 *
 * Supports mobile (5xx, 6xx, 7xx, 8xx) and landline numbers.
 * Accepted input formats: "500123456", "+48500123456", "48 500 123 456", etc.
 */

/**
 * Strip everything except digits and a leading "+".
 */
function stripPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Extract the 9-digit national number from a phone string.
 *
 * @returns 9-digit string or `null` if the input is invalid
 */
function extractNational(phone: string): string | null {
  const stripped = stripPhone(phone);

  // +48 XXXXXXXXX or 48 XXXXXXXXX (12 or 11 digits)
  if (stripped.startsWith('+48') && stripped.length === 12) {
    return stripped.slice(3);
  }
  if (stripped.startsWith('48') && stripped.length === 11) {
    return stripped.slice(2);
  }
  // Plain 9-digit number
  if (stripped.length === 9 && !stripped.startsWith('+')) {
    return stripped;
  }

  return null;
}

/**
 * Validate a Polish phone number.
 *
 * @param phone - raw or formatted phone string
 * @returns `true` when the phone has a valid 9-digit Polish number
 */
export function validatePhone(phone: string): boolean {
  const national = extractNational(phone);

  if (!national) {
    return false;
  }

  // Must start with a valid leading digit (4–9 covers mobiles + landlines)
  const leading = parseInt(national[0], 10);
  return leading >= 4 && leading <= 9;
}

/**
 * Format a phone number as `+48 XXX XXX XXX`.
 *
 * @param phone - raw or partially formatted phone string
 * @returns formatted phone or the original string when it cannot be parsed
 */
export function formatPhone(phone: string): string {
  const national = extractNational(phone);

  if (!national) {
    return phone;
  }

  return `+48 ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6, 9)}`;
}

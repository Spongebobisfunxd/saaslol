/**
 * Polish NIP (Numer Identyfikacji Podatkowej) utilities.
 *
 * NIP is a 10-digit tax-identification number.  The last digit is a
 * modulo-11 checksum computed with weights [6,5,7,2,3,4,5,6,7].
 */

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7] as const;

/**
 * Strip all non-digit characters from a NIP string.
 */
function stripNIP(nip: string): string {
  return nip.replace(/\D/g, '');
}

/**
 * Validate a Polish NIP number (10 digits + checksum).
 *
 * @param nip - raw or formatted NIP string
 * @returns `true` when the NIP has 10 digits and a valid checksum
 */
export function validateNIP(nip: string): boolean {
  const digits = stripNIP(nip);

  if (digits.length !== 10) {
    return false;
  }

  const nums = digits.split('').map(Number);

  const sum = NIP_WEIGHTS.reduce(
    (acc, weight, idx) => acc + weight * nums[idx],
    0,
  );

  return sum % 11 === nums[9];
}

/**
 * Format a NIP string as `XXX-XXX-XX-XX`.
 *
 * @param nip - raw or partially-formatted NIP
 * @returns formatted NIP or the original string when it cannot be formatted
 */
export function formatNIP(nip: string): string {
  const digits = stripNIP(nip);

  if (digits.length !== 10) {
    return nip;
  }

  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
}

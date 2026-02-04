import * as React from 'react';
import { cn } from '../lib/utils';

export interface NIPInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** Raw NIP digits (up to 10) */
  value: string;
  /** Called with raw NIP digits */
  onChange: (nip: string) => void;
  /** Validation error message */
  error?: string;
}

const NIP_WEIGHTS = [6, 5, 7, 2, 3, 4, 5, 6, 7] as const;

function validateNIPChecksum(digits: string): boolean {
  if (digits.length !== 10) return false;
  const nums = digits.split('').map(Number);
  const sum = NIP_WEIGHTS.reduce((acc, w, i) => acc + w * nums[i], 0);
  return sum % 11 === nums[9];
}

/**
 * NIP input with auto-formatting as XXX-XXX-XX-XX and inline checksum
 * validation.  Stores only the raw 10 digits.
 */
const NIPInput = React.forwardRef<HTMLInputElement, NIPInputProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    const formatDisplay = (raw: string): string => {
      const d = raw.replace(/\D/g, '').slice(0, 10);
      const parts: string[] = [];
      if (d.length > 0) parts.push(d.slice(0, 3));
      if (d.length > 3) parts.push(d.slice(3, 6));
      if (d.length > 6) parts.push(d.slice(6, 8));
      if (d.length > 8) parts.push(d.slice(8, 10));
      return parts.join('-');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
      onChange(digits);
    };

    const isComplete = value.length === 10;
    const isValid = isComplete && validateNIPChecksum(value);
    const showCheckError = isComplete && !isValid;

    return (
      <div className="flex flex-col gap-1">
        <div className="relative">
          <input
            ref={ref}
            type="text"
            inputMode="numeric"
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              (error || showCheckError) &&
                'border-destructive focus-visible:ring-destructive',
              isValid && 'border-green-500 focus-visible:ring-green-500',
              className,
            )}
            value={formatDisplay(value)}
            onChange={handleChange}
            placeholder="XXX-XXX-XX-XX"
            maxLength={13} // 10 digits + 3 dashes
            {...props}
          />
          {isValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-xs font-medium">
              OK
            </span>
          )}
        </div>
        {showCheckError && !error && (
          <p className="text-sm text-destructive">
            Nieprawid\u0142owa suma kontrolna NIP.
          </p>
        )}
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  },
);
NIPInput.displayName = 'NIPInput';

export { NIPInput };

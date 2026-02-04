import * as React from 'react';
import { cn } from '../lib/utils';

export interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** Raw phone number (digits only, without country code) */
  value: string;
  /** Called with the raw 9-digit phone number */
  onChange: (phone: string) => void;
  /** Validation error message */
  error?: string;
}

/**
 * Polish phone input with +48 prefix.
 * Auto-formats as XXX XXX XXX while storing only the 9 raw digits.
 */
const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, value, onChange, error, ...props }, ref) => {
    const formatDisplay = (raw: string): string => {
      const digits = raw.replace(/\D/g, '').slice(0, 9);
      const parts: string[] = [];
      if (digits.length > 0) parts.push(digits.slice(0, 3));
      if (digits.length > 3) parts.push(digits.slice(3, 6));
      if (digits.length > 6) parts.push(digits.slice(6, 9));
      return parts.join(' ');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
      onChange(inputDigits);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Allow backspace to work naturally
      if (e.key === 'Backspace' && value.length > 0) {
        e.preventDefault();
        onChange(value.slice(0, -1));
      }
    };

    return (
      <div className="flex flex-col gap-1">
        <div className="relative flex">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
            +48
          </span>
          <input
            ref={ref}
            type="tel"
            inputMode="numeric"
            className={cn(
              'flex h-10 w-full rounded-r-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive',
              className,
            )}
            value={formatDisplay(value)}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="XXX XXX XXX"
            maxLength={11} // 9 digits + 2 spaces
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  },
);
PhoneInput.displayName = 'PhoneInput';

export { PhoneInput };

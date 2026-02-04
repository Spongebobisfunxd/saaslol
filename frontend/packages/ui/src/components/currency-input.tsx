'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  /** Value in grosze (1/100 PLN) */
  value: number;
  /** Called with the new value in grosze */
  onChange: (grosze: number) => void;
}

/**
 * PLN currency input that displays a formatted value (e.g. "1 234,56")
 * with a "zl" suffix, but stores the underlying value in grosze.
 */
const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, onBlur, onFocus, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);

    // Format grosze to display string
    const formatForDisplay = React.useCallback((grosze: number): string => {
      const abs = Math.abs(grosze);
      const zloty = Math.floor(abs / 100);
      const gr = abs % 100;
      const sign = grosze < 0 ? '-' : '';
      const zlotySeparated = zloty
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${sign}${zlotySeparated},${gr.toString().padStart(2, '0')}`;
    }, []);

    // Sync display value from prop when not focused
    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatForDisplay(value));
      }
    }, [value, isFocused, formatForDisplay]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      // Show raw numeric value when focused for easier editing
      const zloty = (value / 100).toFixed(2).replace('.', ',');
      setDisplayValue(zloty);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      // Parse the current display value back to grosze
      const parsed = parseInputToGrosze(displayValue);
      if (!isNaN(parsed)) {
        onChange(parsed);
        setDisplayValue(formatForDisplay(parsed));
      } else {
        setDisplayValue(formatForDisplay(value));
      }
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Allow digits, comma, dot, minus, and spaces
      const filtered = raw.replace(/[^\d,.\-\s]/g, '');
      setDisplayValue(filtered);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm text-right ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
          z\u0142
        </span>
      </div>
    );
  },
);
CurrencyInput.displayName = 'CurrencyInput';

/**
 * Parse a user-typed string into grosze.
 */
function parseInputToGrosze(text: string): number {
  let cleaned = text.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return NaN;
  return Math.round(parsed * 100);
}

export { CurrencyInput };

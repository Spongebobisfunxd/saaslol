'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface BlikCodeInputProps {
  /** The current 6-digit BLIK code (may be incomplete) */
  value: string;
  /** Called with the updated code string */
  onChange: (code: string) => void;
  /** Called when all 6 digits have been entered */
  onComplete?: (code: string) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
  /** Validation error message */
  error?: string;
  /** Additional class names for the wrapper */
  className?: string;
}

/**
 * 6-digit BLIK code input with individual digit cells.
 * Auto-focuses the next cell after each digit is entered.
 */
function BlikCodeInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  error,
  className,
}: BlikCodeInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const digits = value.padEnd(6, '').slice(0, 6).split('');

  const focusInput = (index: number) => {
    if (index >= 0 && index < 6) {
      inputRefs.current[index]?.focus();
      inputRefs.current[index]?.select();
    }
  };

  const handleChange = (index: number, inputValue: string) => {
    // Only accept single digits
    const digit = inputValue.replace(/\D/g, '').slice(-1);
    if (!digit) return;

    const newDigits = [...digits];
    newDigits[index] = digit;

    const newCode = newDigits.join('').replace(/\s/g, '');
    onChange(newCode);

    // Auto-focus next input
    if (index < 5) {
      focusInput(index + 1);
    }

    // Fire onComplete when all 6 digits are entered
    if (newCode.length === 6 && onComplete) {
      onComplete(newCode);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];

      if (digits[index] && digits[index] !== ' ') {
        // Clear current cell
        newDigits[index] = '';
        onChange(newDigits.join('').replace(/\s/g, ''));
      } else if (index > 0) {
        // Move to previous cell and clear it
        newDigits[index - 1] = '';
        onChange(newDigits.join('').replace(/\s/g, ''));
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      focusInput(Math.min(pasted.length, 5));
      if (pasted.length === 6 && onComplete) {
        onComplete(pasted);
      }
    }
  };

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={disabled}
            className={cn(
              'h-14 w-12 rounded-lg border-2 border-input bg-background text-center text-2xl font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              error && 'border-destructive focus-visible:ring-destructive',
            )}
            value={digits[index] === ' ' ? '' : digits[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            aria-label={`Cyfra ${index + 1} kodu BLIK`}
          />
        ))}
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export { BlikCodeInput };

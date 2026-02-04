'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export type ConsentChannel = 'email' | 'sms' | 'push' | 'phone';

export interface ConsentCheckboxProps {
  /** Unique identifier for the consent */
  id: string;
  /** Whether the consent is currently granted */
  checked: boolean;
  /** Called when the consent state changes */
  onCheckedChange: (checked: boolean) => void;
  /** The consent label text (short description) */
  label: string;
  /** Full legal text for the consent */
  fullText?: string;
  /** URL to the full terms/privacy policy */
  termsUrl?: string;
  /** Label for the terms link */
  termsLabel?: string;
  /** Whether this consent is required (cannot proceed without it) */
  required?: boolean;
  /** Communication channels this consent covers */
  channels?: ConsentChannel[];
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Validation error */
  error?: string;
}

const CHANNEL_LABELS: Record<ConsentChannel, string> = {
  email: 'E-mail',
  sms: 'SMS',
  push: 'Push',
  phone: 'Telefon',
};

/**
 * PKE-compliant consent checkbox with required text indicator,
 * communication channel badges, and link to full terms.
 *
 * PKE = Polish Electronic Communications Act (Prawo Komunikacji Elektronicznej).
 */
function ConsentCheckbox({
  id,
  checked,
  onCheckedChange,
  label,
  fullText,
  termsUrl,
  termsLabel = 'Pe\u0142na tre\u015B\u0107',
  required = false,
  channels,
  disabled = false,
  className,
  error,
}: ConsentCheckboxProps) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-start gap-3">
        <CheckboxPrimitive.Root
          id={id}
          checked={checked}
          onCheckedChange={(val) => onCheckedChange(val === true)}
          disabled={disabled}
          className={cn(
            'mt-0.5 peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
            error && 'border-destructive',
          )}
        >
          <CheckboxPrimitive.Indicator
            className="flex items-center justify-center text-current"
          >
            <Check className="h-4 w-4" />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>

        <div className="flex flex-col gap-1">
          <label
            htmlFor={id}
            className={cn(
              'text-sm leading-relaxed cursor-pointer',
              disabled && 'cursor-not-allowed opacity-70',
            )}
          >
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-label="wymagane">
                *
              </span>
            )}
          </label>

          {/* Channel indicators */}
          {channels && channels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {channels.map((channel) => (
                <span
                  key={channel}
                  className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  {CHANNEL_LABELS[channel]}
                </span>
              ))}
            </div>
          )}

          {/* Full text toggle + link */}
          <div className="flex items-center gap-2 text-xs">
            {fullText && (
              <button
                type="button"
                className="text-primary underline-offset-2 hover:underline focus:outline-none"
                onClick={() => setExpanded((prev) => !prev)}
              >
                {expanded ? 'Zwi\u0144' : 'Rozwi\u0144'}
              </button>
            )}
            {termsUrl && (
              <a
                href={termsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-2 hover:underline"
              >
                {termsLabel}
              </a>
            )}
          </div>

          {/* Expanded full text */}
          {expanded && fullText && (
            <p className="mt-1 rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground">
              {fullText}
            </p>
          )}
        </div>
      </div>

      {error && (
        <p className="ml-7 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export { ConsentCheckbox };

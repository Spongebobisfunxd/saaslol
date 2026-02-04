'use client';

import { Delete, CornerDownLeft } from 'lucide-react';

interface NumpadProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  placeholder?: string;
  label?: string;
  formatDisplay?: (value: string) => string;
}

export function Numpad({
  value,
  onChange,
  onSubmit,
  maxLength = 15,
  placeholder = 'Enter number...',
  label,
  formatDisplay,
}: NumpadProps) {
  const handleDigit = (digit: string) => {
    if (value.length < maxLength) {
      onChange(value + digit);
    }
  };

  const handleBackspace = () => {
    onChange(value.slice(0, -1));
  };

  const handleClear = () => {
    onChange('');
  };

  const displayValue = formatDisplay ? formatDisplay(value) : value;

  return (
    <div className="flex flex-col gap-4">
      {/* Label */}
      {label && (
        <p className="text-center text-lg font-medium" style={{ color: '#4a5568' }}>{label}</p>
      )}

      {/* Display area */}
      <div
        className="glow-border rounded-2xl px-6 py-5"
        style={{
          background: 'linear-gradient(180deg, rgba(13, 17, 23, 0.95) 0%, rgba(22, 27, 38, 0.9) 100%)',
        }}
      >
        <p
          className="text-center text-4xl font-bold tracking-wider"
          style={{
            color: value ? '#00d4ff' : '#4a5568',
            textShadow: value ? '0 0 15px rgba(0, 212, 255, 0.4)' : 'none',
          }}
        >
          {value ? displayValue : placeholder}
        </p>
      </div>

      {/* Numpad grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Row 1: 1-3 */}
        <button
          type="button"
          onClick={() => handleDigit('1')}
          className="numpad-btn"
        >
          1
        </button>
        <button
          type="button"
          onClick={() => handleDigit('2')}
          className="numpad-btn"
        >
          2
        </button>
        <button
          type="button"
          onClick={() => handleDigit('3')}
          className="numpad-btn"
        >
          3
        </button>

        {/* Row 2: 4-6 */}
        <button
          type="button"
          onClick={() => handleDigit('4')}
          className="numpad-btn"
        >
          4
        </button>
        <button
          type="button"
          onClick={() => handleDigit('5')}
          className="numpad-btn"
        >
          5
        </button>
        <button
          type="button"
          onClick={() => handleDigit('6')}
          className="numpad-btn"
        >
          6
        </button>

        {/* Row 3: 7-9 */}
        <button
          type="button"
          onClick={() => handleDigit('7')}
          className="numpad-btn"
        >
          7
        </button>
        <button
          type="button"
          onClick={() => handleDigit('8')}
          className="numpad-btn"
        >
          8
        </button>
        <button
          type="button"
          onClick={() => handleDigit('9')}
          className="numpad-btn"
        >
          9
        </button>

        {/* Row 4: Backspace, 0, Enter */}
        <button
          type="button"
          onClick={handleBackspace}
          onDoubleClick={handleClear}
          className="numpad-btn-action"
          style={{
            background: 'linear-gradient(180deg, rgba(74, 85, 104, 0.25) 0%, rgba(74, 85, 104, 0.15) 100%)',
            border: '1px solid rgba(74, 85, 104, 0.3)',
            color: '#e8edf4',
          }}
          aria-label="Backspace (double-click to clear)"
        >
          <Delete className="h-8 w-8" />
        </button>
        <button
          type="button"
          onClick={() => handleDigit('0')}
          className="numpad-btn"
        >
          0
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value}
          className="numpad-btn-action disabled:cursor-not-allowed disabled:opacity-40"
          style={{
            background: 'linear-gradient(180deg, rgba(0, 212, 255, 0.25) 0%, rgba(0, 212, 255, 0.15) 100%)',
            border: '1px solid rgba(0, 212, 255, 0.4)',
            color: '#00d4ff',
            boxShadow: '0 0 15px rgba(0, 212, 255, 0.15)',
          }}
          aria-label="Enter"
        >
          <CornerDownLeft className="h-8 w-8" style={{ filter: 'drop-shadow(0 0 6px rgba(0, 212, 255, 0.5))' }} />
        </button>
      </div>
    </div>
  );
}

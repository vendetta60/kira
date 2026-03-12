import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { Azerbaijani } from 'flatpickr/dist/l10n/az.js';
import { useMemo } from 'react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DateInput({ value, onChange, disabled = false, className }: DateInputProps) {
  const options = useMemo(
    () => ({
      locale: Azerbaijani,
      dateFormat: 'd.m.Y',
      allowInput: true,
    }),
    [],
  );

  return (
    <Flatpickr
      value={value}
      disabled={disabled}
      options={options}
      onChange={(dates: Date[]) => {
        const d = dates[0];
        if (!d) {
          onChange('');
          return;
        }
        // Daxildə ISO saxlayırıq, amma flatpickr ekranda dd.mm.yyyy göstərir
        const iso = d.toISOString().slice(0, 10);
        onChange(iso);
      }}
      className={
        className ||
        'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:bg-gray-100 disabled:text-gray-400'
      }
    />
  );
}


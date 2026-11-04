'use client';

import { useTranslations } from 'next-intl';
import { formatNumber } from '@/lib/format';
import { MinusIcon, PlusIcon } from './icons';

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  locale: string;
  size?: 'md' | 'sm';
};

export function QuantityStepper({ value, onChange, min = 1, max = 20, locale, size = 'md' }: Props) {
  const t = useTranslations('Common');
  const box = size === 'md' ? 'h-12 w-12' : 'h-9 w-9';
  return (
    <div className="inline-flex items-center gap-1 rounded-[var(--radius-pill)] bg-surface-2 p-1">
      <button
        type="button"
        aria-label={t('decrease')}
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={`${box} inline-flex items-center justify-center rounded-full bg-surface text-ink disabled:opacity-40`}
      >
        <MinusIcon />
      </button>
      <span className="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">
        {formatNumber(value, locale)}
      </span>
      <button
        type="button"
        aria-label={t('increase')}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={`${box} inline-flex items-center justify-center rounded-full bg-surface text-ink disabled:opacity-40`}
      >
        <PlusIcon />
      </button>
    </div>
  );
}

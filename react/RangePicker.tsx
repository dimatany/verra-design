'use client';

import React from 'react';
import { useT } from './i18n';

/**
 * ВЫБОР ПЕРИОДА — один на экосистему (v0.6.0).
 *
 * Кнопка с текущим периодом, список пресетов и «свой период» — два поля даты
 * с кнопками «Отмена»/«Применить». Продукты держали РАЗНЫЕ механики: у
 * Metriverra поля дат, у PR Hub календарь-сетка (замечание владельца
 * 22.08.2026: «сделай точно одинаково»). Теперь механика здесь; продукт
 * передаёт текущее значение и получает новое.
 *
 * Значение — строка: '7d' | '30d' | '90d' | 'ytd' | 'custom:ГГГГ-ММ-ДД:ГГГГ-ММ-ДД'.
 */
/** Значение периода: '7d' | '30d' | '90d' | 'ytd' | 'custom:ОТ:ДО'. */
export type RangeValue = string;
const PRESETS = ['7d', '30d', '90d', 'ytd'] as const;
type Preset = (typeof PRESETS)[number];

function formatCustomLabel(start: string, end: string, language: string): string {
  if (!start || !end) return '';
  const [sy, sm, sd] = start.split('-');
  const [ey, em, ed] = end.split('-');
  if (language === 'en') {
    const M: Record<string, string> = {
      '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
      '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
    };
    return `${M[sm]} ${Number(sd)}, ${sy} – ${M[em]} ${Number(ed)}, ${ey}`;
  }
  return `${sd}.${sm}.${sy} – ${ed}.${em}.${ey}`;
}

export default function RangePicker({ value, onChange, language = 'uk', timeZone = 'Europe/Kyiv' }: Readonly<{
  value: RangeValue;
  onChange: (next: RangeValue) => void;
  /** Язык нужен только для формата своей даты (в остальном строки идут через t). */
  language?: string;
  timeZone?: string;
}>) {
  const t = useT();

  const isoDay = React.useCallback((offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return d.toLocaleDateString('en-CA', { timeZone });
  }, [timeZone]);

  const [isOpen, setIsOpen] = React.useState(false);
  const [isCustomOpen, setIsCustomOpen] = React.useState(false);
  const [startDate, setStartDate] = React.useState(() => isoDay(-30));
  const [endDate, setEndDate] = React.useState(() => isoDay(0));
  const [error, setError] = React.useState('');
  const todayIso = isoDay(0);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (value.startsWith('custom:')) {
      const [, start, end] = value.split(':');
      if (start && end) {
        setStartDate(start);
        setEndDate(end);
        setIsCustomOpen(true);
      }
    }
  }, [value]);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setError('');
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const labels = {
    '7d': t('Останні 7 днів', 'Последние 7 дней', 'Last 7 days'),
    '30d': t('Останні 30 днів', 'Последние 30 дней', 'Last 30 days'),
    '90d': t('Останні 90 днів', 'Последние 90 дней', 'Last 90 days'),
    ytd: t('З початку року (YTD)', 'С начала года (YTD)', 'Year to date (YTD)'),
    custom: t('Свій період', 'Свой период', 'Custom range'),
    startDate: t('Дата від', 'Дата от', 'Start date'),
    endDate: t('Дата до', 'Дата до', 'End date'),
    apply: t('Застосувати', 'Применить', 'Apply'),
    cancel: t('Скасувати', 'Отмена', 'Cancel'),
    error: t('Кінцева дата не може бути раніше початкової.', 'Конечная дата не может быть раньше начальной.', 'The end date cannot be earlier than the start date.'),
  } as Record<string, string>;

  const activeLabel = value.startsWith('custom:')
    ? formatCustomLabel(value.split(':')[1], value.split(':')[2], language)
    : labels[value] ?? labels['30d'];

  const selectPreset = (preset: Preset) => {
    onChange(preset);
    setIsOpen(false);
    setIsCustomOpen(false);
    setError('');
  };

  const applyCustom = () => {
    if (!startDate || !endDate || endDate < startDate) {
      setError(labels.error);
      return;
    }
    onChange(`custom:${startDate}:${endDate}`);
    setIsOpen(false);
    setError('');
  };

  const cancelCustom = () => {
    setIsCustomOpen(false);
    setError('');
    if (value.startsWith('custom:')) onChange('30d');
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setError(''); }}
        aria-expanded={isOpen}
        className="select-trigger glass-btn !min-w-0 sm:!min-w-[170px] max-w-[46vw] sm:max-w-none focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-xl"
      >
        <span className="truncate">{activeLabel}</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="pop-panel chrome-glass right-0 top-10 w-[min(320px,calc(100vw-24px))]">
          <div className="flex flex-col gap-0.5">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`pop-item ${value === preset ? 'is-on shadow-pick' : ''}`}
              >
                {labels[preset]}
              </button>
            ))}

            <button
              type="button"
              onClick={() => { setIsCustomOpen(true); setError(''); }}
              className={`pop-item ${value.startsWith('custom:') || isCustomOpen ? 'is-on shadow-pick' : ''}`}
            >
              {labels.custom}
            </button>
          </div>

          {isCustomOpen && (
            <div className="mt-2 rounded-[20px] border border-white/55 bg-white/70 p-4 inset-soft">
              <div className="grid grid-cols-1 min-[480px]:grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1.5 block t-cap font-bold uppercase tracking-widest text-neutral-dark/75">{labels.startDate}</span>
                  <input
                    type="date"
                    value={startDate}
                    max={endDate || todayIso}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="field w-full font-semibold"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block t-cap font-bold uppercase tracking-widest text-neutral-dark/75">{labels.endDate}</span>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    max={todayIso}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="field w-full font-semibold"
                  />
                </label>
              </div>

              {error && <p className="mt-3 t-data font-semibold metric-bad leading-tight">{error}</p>}

              <div className="mt-4 flex justify-end gap-2">
                <button type="button" onClick={cancelCustom} className="btn btn-pill glass-btn btn-quiet">
                  {labels.cancel}
                </button>
                <button type="button" onClick={applyCustom} className="btn btn-pill glass-btn btn-primary hover:brightness-105">
                  {labels.apply}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

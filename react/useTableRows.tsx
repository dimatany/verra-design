'use client';

import React from 'react';
import { useT, useFormatNumber } from './i18n';

/** Сколько строк видно до раскрытия и после него. */
export const PREVIEW_ROWS = 15;
export const EXPANDED_ROWS = 100;

/**
 * Единое поведение длинных таблиц (DESIGN_SYSTEM: одинаковый паттерн везде).
 *
 * Раньше каждая большая таблица сразу печатала 100 строк — карточка растягивалась
 * на несколько экранов, и всё, что под ней, уезжало из виду. Теперь по умолчанию
 * видно топ-15, а полный список (до 100) раскрывается кнопкой.
 *
 * Обрезка НИКОГДА не молчит: и в свёрнутом, и в раскрытом виде подписано,
 * сколько строк показано и сколько их всего.
 */
export function useTableRows<T>(rows: T[]) {
  const [expanded, setExpanded] = React.useState(false);

  // Смена набора строк (другой фильтр/вид/окно) возвращает таблицу в свёрнутый
  // вид — иначе после переключения человек видит хвост чужого списка.
  const total = rows.length;
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional collapse when the row set changes
    setExpanded(false);
  }, [total]);

  const limit = expanded ? EXPANDED_ROWS : PREVIEW_ROWS;
  return {
    visible: rows.slice(0, limit),
    total,
    expanded,
    setExpanded,
    /** Есть ли что раскрывать/подписывать. */
    hasMore: total > PREVIEW_ROWS,
  };
}

/**
 * Подвал длинной таблицы: кнопка «Показать все» + честная подпись об обрезке.
 * `sortNote` — по чему отобраны верхние строки (расходы / текущая сортировка).
 */
export function TableRowsFooter({
  total,
  expanded,
  setExpanded,
  sortedBy = 'cost',
}: Readonly<{
  /** Не используется: перевод даёт провайдер VerraDesignI18n. Оставлен, чтобы
      не трогать существующие вызовы. */
  language?: string;
  total: number;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
  sortedBy?: 'cost' | 'current-sort';
}>) {
  const P = useT();
  const formatNumber = useFormatNumber();
  if (total <= PREVIEW_ROWS) return null;
  const shown = expanded ? Math.min(EXPANDED_ROWS, total) : PREVIEW_ROWS;
  const by = sortedBy === 'cost'
    ? P('за витратами', 'по расходам', 'by spend')
    : P('за поточним сортуванням', 'по текущей сортировке', 'by the current sort');

  // Кнопка — того же веса, что «Синхронизировать всё»: заливка primary, не
  // призрачная. Раньше она была бледной и вплотную к полосе горизонтальной
  // прокрутки таблицы, из-за чего читалась как часть таблицы, а не действие.
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="btn glass-btn btn-primary"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d={expanded ? 'M6 15l6-6 6 6' : 'M6 9l6 6 6-6'} />
        </svg>
        {expanded
          ? P('Згорнути', 'Свернуть', 'Collapse')
          : `${P('Показати всі', 'Показать все', 'Show all')} ${formatNumber(Math.min(EXPANDED_ROWS, total))}`}
      </button>
      <p className="t-cap font-semibold text-neutral-dark/70">
        {P('Показано', 'Показано', 'Showing')} {formatNumber(shown)} {by} {P('з', 'из', 'of')} {formatNumber(total)}
      </p>
    </div>
  );
}

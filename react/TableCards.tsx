'use client';

import React from 'react';

export type CardField = { label: string; value: React.ReactNode };
export type CardRow = {
  key: string;
  title: React.ReactNode;
  /** Подзаголовок: тег, канал, номер — то, что стоит рядом с именем в таблице. */
  meta?: React.ReactNode;
  /** До четырёх полей: подпись · значение. Пятое и дальше не показываются. */
  fields: CardField[];
  /** Действия строки — в конце карточки, никогда в клетке. */
  actions?: React.ReactNode;
};

/**
 * КАРТОЧКА-СТРОКА — мобильный вид таблицы до пяти колонок.
 *
 * На телефоне таблица с четырьмя числами читается как прокрутка вбок — никто не
 * читает. Строка становится карточкой: имя, подзаголовок, до четырёх полей
 * подпись-значение, действия в конце. Компонент сам НЕ решает, когда
 * показываться: продукт кладёт его под `md:hidden`, а таблицу — под
 * `hidden md:block`, и сортировка остаётся у таблицы (карточки принимают уже
 * отсортированные строки).
 */
export default function TableCards({ rows, className = '' }: Readonly<{ rows: CardRow[]; className?: string }>) {
  return (
    <div className={`row-cards ${className}`}>
      {rows.map((r) => (
        <div key={r.key} className="row-card">
          <div className="row-card-head">
            <span className="row-card-title">{r.title}</span>
            {r.meta && <span className="row-card-meta">{r.meta}</span>}
          </div>
          <dl className="row-card-fields">
            {r.fields.slice(0, 4).map((f) => (
              <React.Fragment key={f.label}>
                <dt>{f.label}</dt>
                <dd className="tabular-nums">{f.value}</dd>
              </React.Fragment>
            ))}
          </dl>
          {r.actions && <div className="row-card-actions">{r.actions}</div>}
        </div>
      ))}
    </div>
  );
}

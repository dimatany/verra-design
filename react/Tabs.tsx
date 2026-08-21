'use client';

import React from 'react';

/**
 * Вкладки для страниц, где в одну кучу свалены разные задачи.
 *
 * «Настройки» держали подключения, техническое здоровье, карту покрытия и
 * профиль рабочего пространства одной лентой: человек, пришедший подключить
 * кабинет, пролистывал мимо всего остального, а статусы повторялись в трёх
 * местах. Вкладка — это не украшение, а обещание: на экране ровно одна задача.
 *
 * Выбор запоминается по ключу, чтобы возврат на страницу не сбрасывал человека
 * в начало.
 */
export type TabItem = { id: string; label: string; badge?: number };

export default function Tabs({ items, active, onChange, storageKey, className = '', buttonClassName = '' }: Readonly<{
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  /** Ключ в localStorage; без него выбор живёт только до перезагрузки. */
  storageKey?: string;
  className?: string;
  /** Раскладка кнопок (напр. flex-1 на телефоне). Внешность остаётся у .tabs-folder. */
  buttonClassName?: string;
}>) {
  React.useEffect(() => {
    if (!storageKey) return;
    try { window.localStorage.setItem(storageKey, active); } catch { /* приватный режим */ }
  }, [storageKey, active]);

  return (
    <div role="tablist" className={`tabs-folder ${className}`}>
      {items.map((it) => {
        const selected = it.id === active;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`tabpanel-${it.id}`}
            id={`tab-${it.id}`}
            onClick={() => onChange(it.id)}
            /* вид задаёт .tabs-folder — закладка, а не кнопка */
            className={buttonClassName || undefined}
          >
            {it.label}
            {it.badge ? (
              <span className="ml-2 pill pill-count tabular-nums">
                {it.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Вкладка, пережившая перезагрузку.
 *
 * Значение читается прямо во время рендера, а не в эффекте: правило React —
 * не звать setState в эффекте ради каскада рендеров. На сервере localStorage
 * нет, поэтому первый рендер всегда отдаёт запасную вкладку и совпадает с
 * серверным; сохранённая подхватывается сразу после гидратации, когда браузер
 * впервые перерисует компонент.
 */
export function useStoredTab(storageKey: string, fallback: string): [string, (id: string) => void] {
  const [chosen, setChosen] = React.useState<string | null>(null);
  // useSyncExternalStore — штатный способ читать внешнее хранилище: на сервере
  // отдаёт запасную вкладку, в браузере — сохранённую, и без setState в эффекте.
  const saved = React.useSyncExternalStore(
    subscribeNoop,
    () => readTab(storageKey) ?? fallback,
    () => fallback,
  );
  return [chosen ?? saved, setChosen];
}

/** localStorage меняем только мы сами — подписываться не на что. */
const subscribeNoop = () => () => {};

/** Чтение вкладки из хранилища; приватный режим и SSR отдают null. */
function readTab(storageKey: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

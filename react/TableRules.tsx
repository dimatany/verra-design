'use client';

import React from 'react';

/**
 * ПРАВИЛА ТАБЛИЦ — один раз на приложение, дальше каждая таблица подчиняется им
 * сама.
 *
 * Замечание владельца 24.08.2026 (в который раз): на телефоне первый столбец
 * таблицы обязан быть закреплён, иначе цифры уезжают от имени, к которому
 * относятся. Правило в пакете было, но держалось на памяти автора таблицы:
 *
 *  1) оно применялось только к разметке `.overflow-x-auto > table` — таблица,
 *     прокручиваемая контейнером с любым другим классом (или с overflow из
 *     своего CSS), не закреплялась вовсе;
 *  2) в таблице с `border-collapse: collapse` Safari на iPhone не закрепляет
 *     ячейки в принципе — именно так «Бренды арены» и уехали.
 *
 * Здесь оба условия перестают быть заботой автора. Компонент ничего не рисует:
 * он находит КАЖДУЮ таблицу страницы, поднимается до её настоящего
 * прокручиваемого предка и помечает его классом `.table-scroll`, а самой
 * таблице ставит `.table-pinned` — по этим двум признакам пакет и закрепляет
 * первый столбец. Таблице без прокручиваемого предка он его создаёт: забытая
 * обёртка больше не означает уехавший столбец.
 *
 * За новыми таблицами (раскрыли «Показать все», пришли данные) следит
 * MutationObserver — правило действует и на то, чего при загрузке не было.
 */
export default function TableRules() {
  React.useEffect(() => {
    const isNarrow = () => window.matchMedia('(max-width: 1023.5px)').matches;

    /** Настоящий прокручиваемый предок: смотрим ВЫЧИСЛЕННЫЙ overflow, не класс. */
    const scrollerOf = (table: HTMLElement): HTMLElement | null => {
      let node = table.parentElement;
      while (node && node !== document.body) {
        const overflow = getComputedStyle(node).overflowX;
        if (overflow === 'auto' || overflow === 'scroll') return node;
        node = node.parentElement;
      }
      return null;
    };

    const apply = () => {
      document.querySelectorAll('table').forEach((table) => {
        const scroller = scrollerOf(table);
        if (scroller) {
          scroller.classList.add('table-scroll');
        } else if (table.parentElement) {
          // Обёртку забыли — делаем прокручиваемым ближайшего родителя, иначе
          // таблица просто вылезет за край экрана и часть колонок пропадёт.
          table.parentElement.classList.add('table-scroll', 'table-scroll-made');
        }
        table.classList.add('table-pinned');
      });
    };

    apply();

    const observer = new MutationObserver((records) => {
      const touched = records.some((r) => r.addedNodes.length > 0);
      if (touched) apply();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const mq = window.matchMedia('(max-width: 1023.5px)');
    const onChange = () => { if (isNarrow()) apply(); };
    mq.addEventListener('change', onChange);

    return () => {
      observer.disconnect();
      mq.removeEventListener('change', onChange);
    };
  }, []);

  React.useEffect(() => {
    /**
     * ДЛИННОЕ ИМЯ — ПОЛНОЕ ПО КАСАНИЮ (бывший TableNameTap). Живёт здесь же:
     * оба правила про первый столбец, и продукту незачем помнить о двух
     * компонентах вместо одного.
     */
    const isNarrow = () => window.matchMedia('(max-width: 1023.5px)').matches;

    const onClick = (event: MouseEvent) => {
      if (!isNarrow()) return;
      const target = event.target as HTMLElement | null;
      const cell = target?.closest('td, th') as HTMLElement | null;
      if (!cell) return;

      const row = cell.parentElement;
      if (!row || row.firstElementChild !== cell) return;
      if (cell.hasAttribute('colspan')) return;
      if (!cell.closest('.table-scroll, .overflow-x-auto')) return;

      // Внутри имени бывает ссылка или кнопка — их работа важнее раскрытия.
      if (target?.closest('a, button, input, select, label')) return;

      cell.classList.toggle('cell-name-open');
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}

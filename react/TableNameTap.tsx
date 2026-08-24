'use client';

import React from 'react';

/**
 * ДЛИННОЕ ИМЯ СТРОКИ — ПОЛНОЕ ПО КАСАНИЮ. Один обработчик на всё приложение.
 *
 * На телефоне закреплённый первый столбец таблицы показывает имя в две строки
 * (правило пакета), а по касанию раскрывает его целиком. Вешать обработчик на
 * каждую таблицу продукта нельзя: таблиц десятки, и половина о правиле забудет.
 * Поэтому здесь один слушатель на документе — он смотрит, попало ли касание в
 * первую ячейку строки внутри прокручиваемой таблицы, и переключает класс.
 *
 * Продукт монтирует компонент один раз в оболочке кабинета. Он ничего не
 * рисует.
 *
 * На компьютере правило не действует: там имя и так видно целиком, и лишний
 * клик по строке ничего не должен менять.
 */
export default function TableNameTap() {
  React.useEffect(() => {
    const isNarrow = () => window.matchMedia('(max-width: 1023.5px)').matches;

    const onClick = (event: MouseEvent) => {
      if (!isNarrow()) return;
      const target = event.target as HTMLElement | null;
      const cell = target?.closest('td, th') as HTMLElement | null;
      if (!cell) return;

      // Только ПЕРВАЯ ячейка строки и только внутри таблицы, которая едет вбок:
      // остальные ячейки — числа, разворачивать в них нечего.
      const row = cell.parentElement;
      if (!row || row.firstElementChild !== cell) return;
      if (cell.hasAttribute('colspan')) return;
      if (!cell.closest('.overflow-x-auto')) return;

      // Внутри имени бывает ссылка или кнопка — их работа важнее раскрытия.
      if (target?.closest('a, button, input, select, label')) return;

      cell.classList.toggle('cell-name-open');
    };

    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  return null;
}

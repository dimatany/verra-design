/**
 * ТАБЛИЦА НА ТЕЛЕФОНЕ: ПЕРВЫЙ СТОЛБЕЦ ЗАКРЕПЛЁН — И ЭТО ПРОВЕРЯЕТСЯ.
 *
 * Владелец просила об этом не один раз, и каждый раз находила новую таблицу,
 * которая правило не соблюдает (последняя — «Бренды арены» в PR-хабе,
 * 24.08.2026). Устно правило не держится: его нужно ронять проверкой.
 *
 * Страж требует от КАЖДОЙ таблицы продукта двух вещей:
 *   1) прокручиваемую обёртку рядом (класс с overflow-x: .table-scroll или
 *      .overflow-x-auto) — иначе на узком экране колонки просто вылезут за
 *      край;
 *   2) отсутствие border-collapse: Safari на iPhone в такой таблице не
 *      закрепляет ячейки вовсе.
 *
 * Само закрепление делают правила пакета и компонент react/TableRules — от
 * автора таблицы требуется только не мешать.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, tags, lineOf } from './lib.mjs';

const SCROLLER = /(table-scroll|overflow-x-auto)/;
/** Сколько символов перед <table> считаем «обёрткой рядом». */
const LOOKBEHIND = 400;

test('каждая таблица прокручивается и не мешает закреплению столбца', () => {
  const noScroller = [];
  const collapsed = [];

  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const { tag, index } of tags(source, 'table')) {
      if (/\bborder-collapse\b/.test(tag)) collapsed.push(`${file}:${lineOf(source, index)}`);
      const before = source.slice(Math.max(0, index - LOOKBEHIND), index);
      if (!SCROLLER.test(before)) noScroller.push(`${file}:${lineOf(source, index)}`);
    }
  }

  assert.deepEqual(noScroller, [],
    'Таблица без прокручиваемой обёртки: на телефоне её колонки уедут за край.\n' +
    'Оберните её в <div className="table-scroll"> (правило 3d дизайн-системы):\n' +
    noScroller.join('\n'));

  assert.deepEqual(collapsed, [],
    'В таблице с border-collapse Safari на iPhone не закрепляет первый столбец.\n' +
    'Уберите класс — границы рисуют сами ячейки:\n' +
    collapsed.join('\n'));
});

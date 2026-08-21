/**
 * ЦВЕТ ЖИВЁТ В ПАЛИТРЕ — и нигде больше.
 *
 * История правила (Metriverra): 550 цветов в разметке делали смену палитры
 * обходом девяноста файлов, а тёмную тему — невозможной. После переноса
 * старая палитра ещё два дня жила в rgba-значениях теней и осей графиков —
 * поэтому запрещены ОБЕ записи: hex и числовые rgb()/rgba()/hsl()/oklch().
 * Ссылка на палитру `rgb(var(--…-rgb) / …)` — разрешена.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, lineOf } from './lib.mjs';

test('в разметке нет цветов, вписанных мимо палитры (hex в классах)', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/\[#[0-9a-fA-F]{3,8}\]/g)) offenders.push(`${file}:${lineOf(text, m.index)} ${m[0]}`);
  }
  assert.deepEqual(offenders, [],
    'Цвет в разметке — добавьте его в палитру и используйте по имени:\n' + offenders.join('\n'));
});

test('в коде нет цветов значением (hex и числовые rgb/rgba/hsl/oklch)', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) offenders.push(`${file}:${lineOf(text, m.index)} ${m[0]}`);
    for (const m of text.matchAll(/\b(?:rgba?|hsla?|oklch|oklab)\(\s*\d/g)) offenders.push(`${file}:${lineOf(text, m.index)} ${m[0]}…`);
  }
  assert.deepEqual(offenders, [],
    'Цвет значением в коде — заведите имя в палитре:\n' + offenders.join('\n'));
});

test('в разметке нет сырых цветовых шкал Tailwind (red-700 и подобных)', () => {
  const RAW = /\b(?:text|bg|border|ring|from|to|via|fill|stroke)-(?:red|green|blue|amber|yellow|orange|rose|pink|purple|violet|indigo|sky|cyan|teal|emerald|lime|slate|gray|zinc|stone)-\d{2,3}(?:\/\d+)?\b/g;
  const offenders = [];
  for (const file of tsxFiles()) {
    const text = fs.readFileSync(file, 'utf8');
    for (const m of text.matchAll(RAW)) offenders.push(`${file}:${lineOf(text, m.index)} ${m[0]}`);
  }
  assert.deepEqual(offenders, [],
    'Сырой цвет Tailwind мимо палитры. Возьмите имя из палитры (metric-bad, pill-warn, …):\n' + offenders.join('\n'));
});

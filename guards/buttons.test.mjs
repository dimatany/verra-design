/**
 * КНОПКА В ПРОДУКТЕ ОДНА — три семьи по смыслу, и ни одной «по вкусу
 * страницы».
 *
 * История правила (Metriverra, 20.08.2026): пересчёт нашёл 23 разных
 * внешности кнопок — каждая новая красилась по месту. Человек читает разный
 * вид как разное поведение. Списком такое не чинится: через месяц набежит
 * новый десяток, поэтому правило держит тест.
 *
 * Разрешено ровно три семьи:
 *   .btn-primary — действие (тёмная заливка);
 *   .btn-quiet   — второстепенное (рамка, видна без наведения);
 *   .btn-danger  — необратимое (красная заливка: предупреждение).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, tags, lineOf } from './lib.mjs';

const FAMILIES = ['btn-primary', 'btn-quiet', 'btn-danger'];
const APPEARANCE = /\b(bg-(?!transparent)[\w/[\].-]+|border(?![-\w]*(?:box|collapse))(?:-[\w/[\].-]+)?|text-(?:white|brand-bg|band-ink|paper)[\w/]*)\b/;

test('каждая кнопка с заливкой или рамкой принадлежит одной из трёх семей', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const { tag, index } of tags(source, 'button')) {
      if (!APPEARANCE.test(tag)) continue;
      if (tag.includes('underline') && !/\bbg-(?!transparent)/.test(tag)) continue;
      if (FAMILIES.some((f) => tag.includes(f))) continue;
      offenders.push(`${file}:${lineOf(source, index)}`);
    }
  }
  assert.deepEqual(offenders, [],
    'Кнопка задаёт себе внешность мимо семей. Используйте btn-primary / btn-quiet / btn-danger:\n' + offenders.join('\n'));
});

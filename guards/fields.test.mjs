/**
 * ПОЛЕ ВВОДА В ПРОДУКТЕ ОДНО — класс .field.
 *
 * История правила (Metriverra, 21.08.2026): 72 поля носили 18 разных
 * внешностей — фон от белого/40 до белого/80, скругление от 6 до 16px.
 *
 * Осознанные исключения продукта перечисляются через
 * DESIGN_GUARD_FIELD_ALLOW (классы через запятую) — например, иерархия
 * бюджета Metriverra, где рамка НЕСЁТ СМЫСЛ уровня.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { tsxFiles, tags, lineOf } from './lib.mjs';

const ALLOW = ['field', ...(process.env.DESIGN_GUARD_FIELD_ALLOW ?? '').split(',').map((s) => s.trim()).filter(Boolean)];
const APPEARANCE = /\b(bg-white[\w/[\].]*|border(?![-\w]*(?:box|collapse))(?:-[\w/[\].-]+)?|rounded[\w/[\].-]*)\b/;

/** Ступени текста Tailwind и голый font-size — размер поля задаёт только .field. */
const OWN_SIZE = /\b(text-(xs|sm|base|lg|xl|\[\d+px\])|t-(cap|data|body|lead|h[1-3]))\b|font-size/;

test('поле не задаёт свой размер текста — ступень одна, из .field', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const name of ['input', 'textarea']) {
      for (const { tag, index } of tags(source, name)) {
        if (/type=['"](checkbox|radio|file|hidden|range)/.test(tag)) continue;
        if (!OWN_SIZE.test(tag)) continue;
        offenders.push(`${file}:${lineOf(source, index)}`);
      }
    }
  }
  assert.deepEqual(offenders, [],
    'Размер текста в поле задаёт ТОЛЬКО .field (ступень .t-data). Уберите ступень с поля:\n' + offenders.join('\n'));
});

test('каждое текстовое поле использует .field (или разрешённое исключение)', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const name of ['input', 'textarea', 'select']) {
      for (const { tag, index } of tags(source, name)) {
        if (/type=['"](checkbox|radio|file|hidden|range)/.test(tag)) continue;
        if (!APPEARANCE.test(tag)) continue;
        if (ALLOW.some((a) => new RegExp(`\\b${a}`).test(tag))) continue;
        offenders.push(`${file}:${lineOf(source, index)}`);
      }
    }
  }
  assert.deepEqual(offenders, [],
    'Поле одевает себя мимо системы. Используйте класс .field:\n' + offenders.join('\n'));
});

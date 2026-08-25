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
/**
 * Кнопкой человек считает не тег, а то, что выглядит нажимаемым. Поэтому
 * проверяем и ссылки, и <label>, оформленные как кнопка: аудит 25.08.2026 нашёл
 * двенадцать таких «кнопок», мимо всех правил и мимо этого теста.
 */
const BUTTON_LIKE = ['button', 'Link', 'a', 'label'];
const APPEARANCE = /\b(bg-(?!transparent)[\w/[\].-]+|border(?![-\w]*(?:box|collapse))(?:-[\w/[\].-]+)?|text-(?:white|brand-bg|band-ink|paper)[\w/]*)\b/;

test('каждая кнопка с заливкой или рамкой принадлежит одной из трёх семей', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const name of BUTTON_LIKE) {
      for (const { tag, index } of tags(source, name)) {
        // У ссылок и подписей внешность кнопки — это заливка либо рамка вместе
        // с отступами: подчёркнутая ссылка внутри текста кнопкой не считается.
        if (!APPEARANCE.test(tag)) continue;
        if (name !== 'button' && !/\bp[xy]?-\d|\brounded/.test(tag)) continue;
        if (tag.includes('underline') && !/\bbg-(?!transparent)/.test(tag)) continue;
        if (FAMILIES.some((f) => tag.includes(f))) continue;
        offenders.push(`${file}:${lineOf(source, index)} <${name}>`);
      }
    }
  }
  assert.deepEqual(offenders, [],
    'Кнопка (или ссылка/подпись в виде кнопки) задаёт себе внешность мимо семей.\n'
    + 'Используйте btn-primary / btn-quiet / btn-danger:\n' + offenders.join('\n'));
});


/**
 * ВЫКЛЮЧЕННОЕ СОСТОЯНИЕ ОПИСАНО ОДИН РАЗ — в components.css.
 *
 * Аудит 25.08.2026 нашёл 25 кнопок со своей прозрачностью: два правила поверх
 * друг друга дают разную бледность в разных местах. Именно так внешности и
 * разъезжаются.
 */
test('кнопка не назначает себе выключенное состояние вручную', () => {
  const offenders = [];
  for (const file of tsxFiles()) {
    const source = fs.readFileSync(file, 'utf8');
    for (const name of BUTTON_LIKE) {
      for (const { tag, index } of tags(source, name)) {
        if (!/disabled:opacity-|disabled:bg-|aria-disabled[^>]*opacity-/.test(tag)) continue;
        offenders.push(`${file}:${lineOf(source, index)} <${name}>`);
      }
    }
  }
  assert.deepEqual(offenders, [],
    'Выключенный вид задаётся в дизайн-системе, а не у кнопки. Уберите disabled:opacity-*:\n' + offenders.join('\n'));
});

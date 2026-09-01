/**
 * АВТОПЕРЕВОД БРАУЗЕРА ЗАПРЕЩЁН ВО ВСЕХ ПРОДУКТАХ.
 *
 * 01.09.2026 новый сотрудник открыл панель управления и получил экран ошибки:
 * «insertBefore … is not a child of this node». Причина — переводчик Chrome:
 * он подменяет текстовые узлы прямо в разметке, после чего React не находит
 * свои узлы и страница падает.
 *
 * У продуктов экосистемы есть собственный переключатель на 15 языков. Браузерный
 * перевод не добавляет ничего, а ломает — поэтому выключен.
 *
 * Правило живёт в общем пакете, а не в одном продукте: сначала защиту поставили
 * только в маркетинг-хаб, и владелица справедливо спросила, закрыто ли это у
 * PR-хаба и лендинга. Страж отвечает на этот вопрос за нас.
 *
 * Проверяется корневая разметка — тот файл, где объявлен <html>.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

/** Файлы, объявляющие <html>: у продукта их обычно один. */
function rootLayouts() {
  const found = [];
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name === 'layout.tsx' && /<html\b/.test(fs.readFileSync(full, 'utf8'))) found.push(full);
    }
  };
  walk('src/app');
  return found;
}

test('автоперевод браузера отключён в корневой разметке', () => {
  const layouts = rootLayouts();
  // Продукт без своего <html> (библиотека, пакет) правило не касается.
  if (!layouts.length) return;

  const offenders = [];
  for (const file of layouts) {
    const code = fs.readFileSync(file, 'utf8');
    const missing = [];
    if (!/translate="no"/.test(code)) missing.push('translate="no" у <html>');
    if (!/notranslate/.test(code)) missing.push('класс notranslate');
    if (!/google:\s*['"]notranslate['"]/.test(code)) missing.push("метаданные google: 'notranslate'");
    if (missing.length) offenders.push(`${file}: не хватает ${missing.join(', ')}`);
  }

  assert.deepEqual(
    offenders,
    [],
    'Переводчик браузера подменит разметку и уронит страницу. Нужны все три страховки — ' +
    'Chrome и Safari уважают разные:\n' + offenders.join('\n'),
  );
});

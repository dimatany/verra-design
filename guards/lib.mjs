/**
 * Общий обход файлов для стражей дизайн-системы.
 *
 * Пути настраиваются переменными окружения — пакет не знает, как устроен
 * продукт:
 *   DESIGN_GUARD_ROOTS   — какие папки проверять (через запятую),
 *                          по умолчанию "src/components,src/app";
 *   DESIGN_GUARD_EXCLUDE — подстроки путей, которые пропускаем (через
 *                          запятую), напр. "app/[lang]" для сайта со своей
 *                          палитрой. По умолчанию пусто.
 */
import fs from 'node:fs';
import path from 'node:path';

export const ROOTS = (process.env.DESIGN_GUARD_ROOTS ?? 'src/components,src/app')
  .split(',').map((s) => s.trim()).filter(Boolean);
export const EXCLUDE = (process.env.DESIGN_GUARD_EXCLUDE ?? '')
  .split(',').map((s) => s.trim()).filter(Boolean);

export function tsxFiles() {
  const out = [];
  const walk = (dir) => {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (EXCLUDE.some((e) => full.includes(e))) continue;
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) out.push(full);
    }
  };
  for (const root of ROOTS) walk(root);
  return out;
}

/** Все теги `<name …>` вместе с атрибутами — включая шаблонные className. */
export function tags(source, name) {
  const found = [];
  const re = new RegExp(String.raw`<${name}\b`, 'g');
  let m;
  while ((m = re.exec(source))) {
    let depth = 0;
    let i = m.index;
    for (; i < source.length; i += 1) {
      const ch = source[i];
      if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      else if (ch === '>' && depth === 0) break;
    }
    found.push({ tag: source.slice(m.index, i), index: m.index });
  }
  return found;
}

export const lineOf = (source, index) => source.slice(0, index).split('\n').length;

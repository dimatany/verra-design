'use client';

import React from 'react';
import { createPortal } from 'react-dom';

/**
 * МОДАЛЬНОЕ ОКНО В ПРОЕКТЕ ОДНО.
 *
 * До 21.08.2026 их было два: выбор языка собирал портал с пеленой сам, а
 * подтверждения в «Команде» — свой `<dialog>`. Внешность уже была общей
 * (.modal-scrim / .modal-panel в globals.css), но каркас — поведение, а
 * поведение живёт в компоненте: портал поверх всего, закрытие по Escape и
 * по клику в пелену, ровно один способ на весь проект.
 *
 * `ariaLabel` обязателен: окно без имени читалка объявляет как «диалог» —
 * человек не знает, что открылось.
 */
export default function Modal({ onClose, ariaLabel, panelClassName = 'w-full max-w-md p-5', children }: Readonly<{
  onClose: () => void;
  ariaLabel: string;
  /** Ширина/отступы панели; внешность (фон, рамка, тень) — у .modal-panel. */
  panelClassName?: string;
  children: React.ReactNode;
}>) {
  const panelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  /**
   * ФОКУС ЖИВЁТ ВНУТРИ ОКНА (25.08.2026).
   *
   * Раньше окно только закрывалось по Escape: клавиатура и экранный диктор
   * спокойно уходили за него — человек «тыкал» вслепую в интерфейс, который
   * не видит, а вернувшись, оказывался в начале страницы. Теперь фокус входит
   * в панель, ходит по кругу внутри неё (Tab и Shift+Tab) и возвращается туда,
   * откуда окно открыли.
   */
  React.useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusable = () => {
      if (!panel) return [] as HTMLElement[];
      return [...panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )].filter((el) => el.offsetParent !== null || el === document.activeElement);
    };

    // Первый фокус — на первом органе управления окна, иначе на самой панели.
    const first = focusable()[0];
    (first ?? panel)?.focus?.();

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const items = focusable();
      if (items.length === 0) {
        event.preventDefault();
        panel?.focus();
        return;
      }
      const current = document.activeElement as HTMLElement | null;
      const index = current ? items.indexOf(current) : -1;
      const next = event.shiftKey ? index - 1 : index + 1;
      if (index === -1 || next < 0 || next >= items.length) {
        event.preventDefault();
        items[event.shiftKey ? items.length - 1 : 0].focus();
      }
    };

    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      opener?.focus?.();
    };
  }, []);

  /**
   * Пока окно открыто, страница за ним не прокручивается.
   *
   * Без этого на телефоне выходило так: человек тянет длинную форму, палец
   * доходит до края панели — и дальше едет САМА СТРАНИЦА, утаскивая окно под
   * верхнюю полосу. Верх формы становилось не достать (замечание владельца
   * 24.08.2026). Позицию страницы запоминаем и возвращаем при закрытии, иначе
   * список за окном прыгнет в начало.
   */
  React.useEffect(() => {
    const { body } = document;
    const scrollY = window.scrollY;
    const previous = { position: body.style.position, top: body.style.top, width: body.style.width, overflow: body.style.overflow };
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
    };
  }, []);

  return createPortal(
    <div
      className="modal-stage fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 2147483647 }}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      {/* Пелена не должна быть остановкой для клавиатуры: закрытие есть по
          Escape и по кнопке внутри окна. */}
      <button type="button" tabIndex={-1} aria-hidden="true" className="modal-scrim" onClick={onClose} />
      <div ref={panelRef} tabIndex={-1} className={`modal-panel outline-none ${panelClassName}`}>{children}</div>
    </div>,
    document.body,
  );
}

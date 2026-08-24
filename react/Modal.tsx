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
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

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
      <button type="button" aria-label="✕" className="modal-scrim" onClick={onClose} />
      <div className={`modal-panel ${panelClassName}`}>{children}</div>
    </div>,
    document.body,
  );
}

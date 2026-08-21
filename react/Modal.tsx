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

  return createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
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

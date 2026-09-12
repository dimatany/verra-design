'use client';

import React from 'react';

/**
 * ЗАКРЫТИЕ ВЫПАДАЮЩЕГО ПО КЛИКУ МИМО, ПО ESC И ПРИ УХОДЕ ФОКУСА — одно правило
 * на все списки пакета (12.09.2026, замечание владелицы: «выбрала кабинет,
 * а список закрывается только по стрелке»).
 *
 * Слушаем `pointerdown`, а не `mousedown`: он один покрывает мышь, палец и
 * стилус, и в Safari приходит надёжнее. Уход фокуса (Tab наружу) тоже
 * закрывает — иначе список висел открытым поверх страницы.
 */
export function useDismiss(
  open: boolean,
  inside: ReadonlyArray<() => Element | null | undefined>,
  onClose: () => void,
): void {
  const closeRef = React.useRef(onClose);
  closeRef.current = onClose;
  React.useEffect(() => {
    if (!open) return;
    const isInside = (target: EventTarget | null) => {
      if (!(target instanceof Node)) return false;
      return inside.some((get) => get()?.contains(target));
    };
    const onPointer = (e: PointerEvent | MouseEvent) => { if (!isInside(e.target)) closeRef.current(); };
    const onFocus = (e: FocusEvent) => { if (!isInside(e.target)) closeRef.current(); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeRef.current(); };
    const hasPointer = typeof window !== 'undefined' && 'PointerEvent' in window;
    document.addEventListener(hasPointer ? 'pointerdown' : 'mousedown', onPointer as EventListener, true);
    document.addEventListener('focusin', onFocus, true);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener(hasPointer ? 'pointerdown' : 'mousedown', onPointer as EventListener, true);
      document.removeEventListener('focusin', onFocus, true);
      document.removeEventListener('keydown', onKey);
    };
    // inside — стабильные геттеры рефов; их идентичность не важна.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
}

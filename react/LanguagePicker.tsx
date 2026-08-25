'use client';

import React from 'react';
import Modal from './Modal';
import { useT } from './i18n';

/**
 * ВЫБОР ЯЗЫКА ИНТЕРФЕЙСА — один на все продукты экосистемы.
 *
 * До 24.08.2026 у каждого продукта был свой: разные кнопки (круглая с кодом
 * против «пилюли»), разные окна, разные сетки плиток и даже разные тексты про
 * машинный перевод. Владелец находил расхождения глазами, бегая между хабами;
 * теперь элемент один, и расходиться нечему.
 *
 * Компонент «немой»: он не знает, где продукт хранит язык (кука, контекст,
 * сервер) — получает текущий язык, список и обработчик выбора.
 *
 * Флаги — эмодзи. Это осознанное исключение из правила «иконки только SVG»:
 * пятнадцать флагов иначе означали бы пятнадцать картинок в сборке.
 */

export type LanguageOption = {
  /** Код языка: `uk`, `en`, `ru`… */
  code: string;
  /** Название на своём языке. */
  name: string;
  /** Флаг эмодзи. */
  flag: string;
};

export default function LanguagePicker({
  value, options, onPick, chosen = true, className = '',
}: Readonly<{
  /** Текущий язык. */
  value: string;
  /** Все языки продукта. */
  options: readonly LanguageOption[];
  /** Что сделать с выбором — продукт сам решает, где его хранить. */
  onPick: (code: string) => void;
  /**
   * Человек уже выбирал язык осознанно. Нет — на кнопке глобус вместо кода:
   * язык, угаданный по браузеру, не стоит выдавать за выбор пользователя.
   */
  chosen?: boolean;
  className?: string;
}>) {
  const t = useT();
  const [open, setOpen] = React.useState(false);
  const title = t('Мова інтерфейсу', 'Язык интерфейса', 'Interface language');

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={title}
        aria-label={title}
        className={`btn btn-sm btn-pill glass-btn btn-quiet backdrop-blur-sm ${className}`}
      >
        {chosen ? (
          <span className="t-cap font-bold uppercase tracking-wider px-0.5">{value}</span>
        ) : (
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3a13.5 13.5 0 000 18M12 3a13.5 13.5 0 010 18" />
          </svg>
        )}
      </button>

      {open && (
        <Modal
          onClose={() => setOpen(false)}
          ariaLabel={title}
          panelClassName="w-full max-w-[560px] max-h-[calc(100dvh-48px)] overflow-y-auto overscroll-contain p-6"
        >
          <div className="flex items-start justify-between gap-4 pb-4">
            <div>
              <h3 className="heading-block">{title}</h3>
              <p className="t-data text-neutral-dark/80 font-medium mt-1.5 font-sans">
                {t(
                  'Мови поза українською, російською та англійською перекладено автоматично (ШІ).',
                  'Языки вне украинского, русского и английского переведены автоматически (ИИ).',
                  'Languages beyond Ukrainian, Russian and English are machine-translated (AI).',
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn btn-sm btn-icon btn-pill glass-btn glass-btn-flat btn-quiet shrink-0"
              aria-label={t('Закрити', 'Закрыть', 'Close')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-sans">
            {options.map((option) => {
              const active = option.code === value;
              return (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => { onPick(option.code); setOpen(false); }}
                  className={`pop-item glass-btn glass-btn-flat ${active ? 'is-on shadow-pick' : ''}`}
                  aria-selected={active}
                >
                  <span className="t-kpi leading-none shrink-0" aria-hidden="true">{option.flag}</span>
                  <span className="min-w-0">
                    <span className="block truncate t-data font-bold leading-tight">{option.name}</span>
                    <span className={`block t-cap font-bold uppercase tracking-wider mt-0.5 ${active ? 'text-brand-bg/75' : 'text-neutral-dark/70'}`}>
                      {option.code}
                    </span>
                  </span>
                  {active && (
                    <svg className="w-4 h-4 ml-auto shrink-0" viewBox="0 0 20 20" fill="none">
                      <path d="M4.5 10.2L8 13.7L15.5 6.3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </Modal>
      )}
    </>
  );
}

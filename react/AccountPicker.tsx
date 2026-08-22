'use client';

import React from 'react';
import MultiSelect from './MultiSelect';
import { useT } from './i18n';
/** Один подключённый кабинет мульти-аккаунтного канала. */
export interface SourceAccountRef {
  key: string;
  name: string;
  accountId?: string;
}

/**
 * Unified per-account picker for multi-account channels (Google Ads, GA4,
 * Merchant, Search Console, Meta). ONE control everywhere: a checkbox dropdown
 * (built on MultiSelect) where `selected` is the chosen account keys and an
 * empty array means "all accounts combined". So you can view everything, one
 * account, or any subset (e.g. 2 of 3) — identically on every channel.
 *
 * Renders NOTHING when the channel has 0–1 accounts (no choice to make), so
 * single-account tenants see exactly what they saw before.
 */
export type AccountPickerProps = Readonly<{
  accounts: SourceAccountRef[] | undefined;
  /** Selected account keys; [] = all combined. */
  selected: string[];
  onChange: (keys: string[]) => void;
  language: string;
  className?: string;
  buttonClassName?: string;
}>;

export default function AccountPicker({
  accounts,
  selected,
  onChange,
  language,
  className = '',
  buttonClassName = '',
}: AccountPickerProps) {
  // Хук вызывается ДО любого раннего выхода: при первом рендере с одним
  // кабинетом React запоминал бы иной порядок хуков, и появление второго
  // кабинета роняло бы компонент (найдено проверкой качества 22.08.2026).
  const t = useT();
  const allLabel = t('Усі кабінети', 'Все кабинеты', 'All accounts');

  if (!accounts || accounts.length < 2) return null;

  const options = accounts.map((a) => ({ value: a.key, label: a.name, description: a.accountId }));

  return (
    <MultiSelect
      options={options}
      selected={selected}
      onChange={onChange}
      allLabel={allLabel}
      className={className}
      buttonClassName={buttonClassName}
    />
  );
}

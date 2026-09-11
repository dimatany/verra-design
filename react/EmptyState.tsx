'use client';

import React from 'react';

/**
 * ПУСТОЕ СОСТОЯНИЕ — один вид на всю экосистему.
 *
 * Пустой блок без слов выглядит как поломка. Здесь три вещи: что пусто,
 * почему, что сделать (кнопка — по желанию продукта, из семьи btn-quiet).
 * Пунктирная рамка — та же, что у «системных» строк L3: это не данные, а
 * место для них.
 */
export default function EmptyState({ title, text, action, className = '' }: Readonly<{
  title: string;
  text?: string;
  action?: React.ReactNode;
  className?: string;
}>) {
  return (
    <div className={`empty-state ${className}`} role="status">
      <p className="empty-state-title">{title}</p>
      {text && <p className="empty-state-text">{text}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
